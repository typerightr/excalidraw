import { pointFrom, pointRotateRads } from "@excalidraw/math";
import type { Radians } from "@excalidraw/math";
import { sceneCoordsToViewportCoords } from "@excalidraw/common";
import { getElementAbsoluteCoords, isTextElement } from "@excalidraw/element";
import type { ExcalidrawElement, NonDeletedExcalidrawElement } from "@excalidraw/element/types";
import type { ElementsMap } from "@excalidraw/element/types";
import type { AppState } from "../../types";

export type QuickAddSide = "top" | "right" | "bottom" | "left";

const HANDLE_OFFSET_FACTOR = 0.12;
const HANDLE_OFFSET_MIN = 8;
const BUFFER_ZONE_THICKNESS = 22;

/** Whether the element type supports quick-add handles (rectangle, diamond, ellipse, sticky note). */
export function isQuickAddHandleSupported(
  element: ExcalidrawElement,
): boolean {
  if (element.locked) return false;
  if (element.type === "rectangle") {
    return true; // includes sticky note (rectangle with customData.isStickyNote)
  }
  if (element.type === "diamond" || element.type === "ellipse") {
    return true;
  }
  return false;
}

/** Resolve the origin shape for quick-add: the selected element or its container if it's bound text. */
export function getQuickAddOriginShape(
  selectedElement: NonDeletedExcalidrawElement,
  elementsMap: ElementsMap,
): NonDeletedExcalidrawElement | null {
  const container =
    isTextElement(selectedElement) && selectedElement.containerId
      ? (elementsMap.get(selectedElement.containerId) as
          | NonDeletedExcalidrawElement
          | undefined) ?? null
      : null;
  const shape = container ?? selectedElement;
  return isQuickAddHandleSupported(shape) ? shape : null;
}

/** Compute handle offset from shape edge: max(8, 0.12 * min(width, height)). */
export function getQuickAddHandleOffset(element: {
  width: number;
  height: number;
}): number {
  return Math.max(
    HANDLE_OFFSET_MIN,
    HANDLE_OFFSET_FACTOR * Math.min(element.width, element.height),
  );
}

/** Local midpoint positions (before rotation) with outward offset. */
function getLocalHandlePositions(
  width: number,
  height: number,
  offset: number,
): Record<QuickAddSide, [number, number]> {
  const halfW = width / 2;
  const halfH = height / 2;
  return {
    top: [halfW, -offset],
    right: [width + offset, halfH],
    bottom: [halfW, height + offset],
    left: [-offset, halfH],
  };
}

export interface HandleViewportPosition {
  side: QuickAddSide;
  x: number;
  y: number;
  /** For hit-testing the handle circle. */
  radius: number;
  /** Buffer zone thickness in viewport px (for hover zone). */
  bufferThickness: number;
}

/**
 * Get the four handle positions in viewport coordinates, rotated with the shape,
 * and clamped to viewport.
 */
export function getQuickAddHandlePositions(
  element: NonDeletedExcalidrawElement,
  appState: AppState,
): HandleViewportPosition[] {
  const { width, height, angle } = element;
  const offset = getQuickAddHandleOffset(element);
  const centerLocal: [number, number] = [width / 2, height / 2];
  const centerSceneX = element.x + centerLocal[0];
  const centerSceneY = element.y + centerLocal[1];

  const localPositions = getLocalHandlePositions(width, height, offset);
  const sides: QuickAddSide[] = ["top", "right", "bottom", "left"];

  const viewportWidth = appState.width;
  const viewportHeight = appState.height;
  const handleRadius = 6;
  const bufferThickness = BUFFER_ZONE_THICKNESS;

  return sides.map((side) => {
    const [lx, ly] = localPositions[side];
    const rotated = pointRotateRads(
      pointFrom(element.x + lx, element.y + ly),
      pointFrom(centerSceneX, centerSceneY),
      (angle ?? 0) as Radians,
    );
    const sx = rotated[0];
    const sy = rotated[1];
    const { x: vx, y: vy } = sceneCoordsToViewportCoords(
      { sceneX: sx, sceneY: sy },
      appState,
    );
    const relX = vx - appState.offsetLeft;
    const relY = vy - appState.offsetTop;
    const clampedX = Math.max(
      handleRadius,
      Math.min(viewportWidth - handleRadius, relX),
    );
    const clampedY = Math.max(
      handleRadius,
      Math.min(viewportHeight - handleRadius, relY),
    );
    return {
      side,
      x: clampedX,
      y: clampedY,
      radius: handleRadius,
      bufferThickness,
    };
  });
}

export { BUFFER_ZONE_THICKNESS };
