import type { GlobalPoint, Radians } from "@excalidraw/math";
import type { Bounds } from "@excalidraw/common";
import type { ElementsMap, NonDeletedExcalidrawElement } from "@excalidraw/element/types";
import type { AppState, UIAppState } from "../../types";
export declare const DEFAULT_LINK_SIZE = 12;
/** Lazy-initialized so module load is safe in SSR (no document). */
export declare function getExternalLinkImg(): HTMLImageElement;
/** Lazy-initialized so module load is safe in SSR (no document). */
export declare function getElementLinkImg(): HTMLImageElement;
export declare const getLinkHandleFromCoords: ([x1, y1, x2, y2]: Bounds, angle: Radians, appState: Pick<UIAppState, "zoom">) => Bounds;
export declare const isPointHittingLinkIcon: (element: NonDeletedExcalidrawElement, elementsMap: ElementsMap, appState: AppState, [x, y]: GlobalPoint) => boolean;
export declare const isPointHittingLink: (element: NonDeletedExcalidrawElement, elementsMap: ElementsMap, appState: AppState, [x, y]: GlobalPoint, isMobile: boolean) => boolean;
