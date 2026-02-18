interface TTDDialogOutputProps {
    error: Error | null;
    canvasRef: React.RefObject<HTMLDivElement | null>;
    loaded: boolean;
    hideErrorDetails?: boolean;
}
export declare const TTDDialogOutput: ({ error, canvasRef, loaded, hideErrorDetails, }: TTDDialogOutputProps) => import("react/jsx-runtime").JSX.Element;
export {};
