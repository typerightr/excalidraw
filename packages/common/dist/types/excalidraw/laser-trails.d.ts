import type { Trail } from "./animated-trail";
import type { AnimationFrameHandler } from "./animation-frame-handler";
import type App from "./components/App";
/**
 * No-op stub for laser trails. Laser tool has been removed;
 * this satisfies the Trail interface for SVGLayer.
 */
export declare class LaserTrails implements Trail {
    constructor(_animationFrameHandler: AnimationFrameHandler, _app: App);
    startPath(_x: number, _y: number): void;
    addPointToPath(_x: number, _y: number): void;
    endPath(): void;
    start(_container: SVGSVGElement): void;
    stop(): void;
}
