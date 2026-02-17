import type { ReactNode } from "react";
import type { EditorInterface } from "@excalidraw/common";
import type { ActionManager } from "../../actions/manager";
import type { AppClassProperties, AppState, UIAppState } from "../../types";
import type { AppProps } from "../../types";
export type FooterShapesSpacing = {
    toolbarColGap: number;
    toolbarRowGap: number;
    toolbarInnerRowGap: number;
    islandPadding: number;
    collabMarginLeft: number;
};
declare const Footer: {
    ({ appState, actionManager, showExitZenModeBtn, renderWelcomeScreen, footerCenterContent, setAppState, onLockToggle, onHandToolToggle, onPenModeToggle, UIOptions, app, isCollaborating, editorInterface, spacing, isCompactStylesPanel, }: {
        appState: UIAppState;
        actionManager: ActionManager;
        showExitZenModeBtn: boolean;
        renderWelcomeScreen: boolean;
        footerCenterContent?: ReactNode;
        setAppState: React.Component<any, AppState>["setState"];
        onLockToggle: () => void;
        onHandToolToggle: () => void;
        onPenModeToggle: AppClassProperties["togglePenMode"];
        UIOptions: AppProps["UIOptions"];
        app: AppClassProperties;
        isCollaborating: boolean;
        editorInterface: EditorInterface;
        spacing: FooterShapesSpacing;
        isCompactStylesPanel: boolean;
    }): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export default Footer;
