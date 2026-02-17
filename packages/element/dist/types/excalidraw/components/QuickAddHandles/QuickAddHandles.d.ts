import { type QuickAddSide } from "./utils";
import type { NonDeletedExcalidrawElement } from "@excalidraw/element/types";
import type { AppState } from "../../types";
import "./QuickAddHandles.scss";
export type QuickAddHandlesProps = {
    originShape: NonDeletedExcalidrawElement;
    appState: AppState;
    onActivate: (side: QuickAddSide, originShapeId: string) => void;
};
export declare function QuickAddHandles({ originShape, appState, onActivate, }: QuickAddHandlesProps): import("react/jsx-runtime").JSX.Element;
