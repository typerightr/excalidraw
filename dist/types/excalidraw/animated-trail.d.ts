import type { AnimationFrameHandler } from "./animation-frame-handler";
import type App from "./components/App";
/** [x, y, pressure/timestamp] - same shape as eraser/lasso trail points */
export type TrailPoint = [number, number, number];
/** Minimal in-package trail buffer (replaces @excalidraw/laser-pointer for eraser/lasso). */
declare class TrailBuffer {
    originalPoints: TrailPoint[];
    options: {
        size: number;
        keepHead: boolean;
    };
    constructor(options?: Partial<{
        size: number;
        keepHead: boolean;
    }>);
    addPoint(point: TrailPoint): void;
    close(): void;
    /** Returns points for stroke path; optional sizeOverride ignored in minimal impl. */
    getStrokeOutline(_sizeOverride?: number): TrailPoint[];
}
export interface Trail {
    start(container: SVGSVGElement): void;
    stop(): void;
    startPath(x: number, y: number): void;
    addPointToPath(x: number, y: number): void;
    endPath(): void;
}
export interface AnimatedTrailOptions {
    fill: (trail: AnimatedTrail) => string;
    stroke?: (trail: AnimatedTrail) => string;
    animateTrail?: boolean;
}
/** Details for sizeMapping callback (used by eraser/lasso; not used by minimal TrailBuffer). */
export interface TrailSizeMappingDetails {
    pressure: number;
    runningLength: number;
    currentIndex: number;
    totalLength: number;
}
type TrailOptions = Partial<{
    size: number;
    keepHead: boolean;
    streamline: number;
    animateTrail: boolean;
    sizeMapping: (details: TrailSizeMappingDetails) => number;
}> & Partial<AnimatedTrailOptions>;
export declare class AnimatedTrail implements Trail {
    private animationFrameHandler;
    protected app: App;
    private options;
    private currentTrail?;
    private pastTrails;
    private container?;
    private trailElement;
    private trailAnimation?;
    constructor(animationFrameHandler: AnimationFrameHandler, app: App, options: TrailOptions);
    get hasCurrentTrail(): boolean;
    hasLastPoint(x: number, y: number): boolean;
    start(container?: SVGSVGElement): void;
    stop(): void;
    startPath(x: number, y: number): void;
    addPointToPath(x: number, y: number): void;
    endPath(): void;
    getCurrentTrail(): TrailBuffer | undefined;
    clearTrails(): void;
    private update;
    private onFrame;
    private drawTrail;
}
export {};
