import type { ExcalidrawElement, NonDeletedExcalidrawElement } from "@excalidraw/element/types";
import type { ElementsMap } from "@excalidraw/element/types";
import type { AppState } from "../../types";
export type QuickAddSide = "top" | "right" | "bottom" | "left";
declare const BUFFER_ZONE_THICKNESS = 22;
/** Whether the element type supports quick-add handles (rectangle, diamond, ellipse, sticky note). */
export declare function isQuickAddHandleSupported(element: ExcalidrawElement): boolean;
/** Resolve the origin shape for quick-add: the selected element or its container if it's bound text. */
export declare function getQuickAddOriginShape(selectedElement: NonDeletedExcalidrawElement, elementsMap: ElementsMap): NonDeletedExcalidrawElement | null;
/** Compute handle offset from shape edge: max(8, 0.12 * min(width, height)). */
export declare function getQuickAddHandleOffset(element: {
    width: number;
    height: number;
}): number;
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
export declare function getQuickAddHandlePositions(element: NonDeletedExcalidrawElement, appState: AppState): HandleViewportPosition[];
export { BUFFER_ZONE_THICKNESS };
