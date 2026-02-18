import {
  SVG_NS,
  getSvgPathFromStroke,
  sceneCoordsToViewportCoords,
} from "@excalidraw/common";

import type { AnimationFrameHandler } from "./animation-frame-handler";
import type App from "./components/App";
import type { AppState } from "./types";

/** [x, y, pressure/timestamp] - same shape as eraser/lasso trail points */
export type TrailPoint = [number, number, number];

/** Minimal in-package trail buffer (replaces @excalidraw/laser-pointer for eraser/lasso). */
class TrailBuffer {
  originalPoints: TrailPoint[] = [];
  options: { size: number; keepHead: boolean } = { size: 2, keepHead: false };

  constructor(options?: Partial<{ size: number; keepHead: boolean }>) {
    if (options) {
      this.options = { ...this.options, ...options };
    }
  }

  addPoint(point: TrailPoint): void {
    const last = this.originalPoints[this.originalPoints.length - 1];
    if (last && last[0] === point[0] && last[1] === point[1]) {
      return;
    }
    this.originalPoints.push(point);
  }

  close(): void {
    // no-op for minimal implementation
  }

  /** Returns points for stroke path; optional sizeOverride ignored in minimal impl. */
  getStrokeOutline(_sizeOverride?: number): TrailPoint[] {
    return [...this.originalPoints];
  }
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
}> &
  Partial<AnimatedTrailOptions>;

export class AnimatedTrail implements Trail {
  private currentTrail?: TrailBuffer;
  private pastTrails: TrailBuffer[] = [];

  private container?: SVGSVGElement;
  private trailElement: SVGPathElement;
  private trailAnimation?: SVGAnimateElement;

  constructor(
    private animationFrameHandler: AnimationFrameHandler,
    protected app: App,
    private options: TrailOptions,
  ) {
    this.animationFrameHandler.register(this, this.onFrame.bind(this));

    this.trailElement = document.createElementNS(SVG_NS, "path");
    if (this.options.animateTrail) {
      this.trailAnimation = document.createElementNS(SVG_NS, "animate");
      this.trailAnimation.setAttribute("attributeName", "stroke-dashoffset");
      this.trailElement.setAttribute("stroke-dasharray", "7 7");
      this.trailElement.setAttribute("stroke-dashoffset", "10");
      this.trailAnimation.setAttribute("from", "0");
      this.trailAnimation.setAttribute("to", `-14`);
      this.trailAnimation.setAttribute("dur", "0.3s");
      this.trailElement.appendChild(this.trailAnimation);
    }
  }

  get hasCurrentTrail() {
    return !!this.currentTrail;
  }

  hasLastPoint(x: number, y: number) {
    if (this.currentTrail) {
      const len = this.currentTrail.originalPoints.length;
      return (
        this.currentTrail.originalPoints[len - 1][0] === x &&
        this.currentTrail.originalPoints[len - 1][1] === y
      );
    }
    return false;
  }

  start(container?: SVGSVGElement) {
    if (container) {
      this.container = container;
    }
    if (this.trailElement.parentNode !== this.container && this.container) {
      this.container.appendChild(this.trailElement);
    }
    this.animationFrameHandler.start(this);
  }

  stop() {
    this.animationFrameHandler.stop(this);
    if (this.trailElement.parentNode === this.container) {
      this.container?.removeChild(this.trailElement);
    }
  }

  startPath(x: number, y: number) {
    const size = typeof this.options.size === "number" ? this.options.size : 2;
    const keepHead =
      typeof this.options.keepHead === "boolean" ? this.options.keepHead : false;
    this.currentTrail = new TrailBuffer({ size, keepHead });
    this.currentTrail.addPoint([x, y, performance.now()]);
    this.update();
  }

  addPointToPath(x: number, y: number) {
    if (this.currentTrail) {
      this.currentTrail.addPoint([x, y, performance.now()]);
      this.update();
    }
  }

  endPath() {
    if (this.currentTrail) {
      this.currentTrail.close();
      this.currentTrail.options.keepHead = false;
      this.pastTrails.push(this.currentTrail);
      this.currentTrail = undefined;
      this.update();
    }
  }

  getCurrentTrail() {
    return this.currentTrail;
  }

  clearTrails() {
    this.pastTrails = [];
    this.currentTrail = undefined;
    this.update();
  }

  private update() {
    this.start();
    if (this.trailAnimation) {
      this.trailAnimation.setAttribute("begin", "indefinite");
      this.trailAnimation.setAttribute("repeatCount", "indefinite");
    }
  }

  private onFrame() {
    const paths: string[] = [];
    for (const trail of this.pastTrails) {
      paths.push(this.drawTrail(trail, this.app.state));
    }
    if (this.currentTrail) {
      paths.push(this.drawTrail(this.currentTrail, this.app.state));
    }
    this.pastTrails = this.pastTrails.filter(
      (trail) => trail.getStrokeOutline().length !== 0,
    );
    if (paths.length === 0) {
      this.stop();
    }
    const svgPaths = paths.join(" ").trim();
    this.trailElement.setAttribute("d", svgPaths);
    const fill = (this.options.fill ?? (() => "black"))(this);
    this.trailElement.setAttribute("fill", fill);
    if (this.trailAnimation) {
      this.trailElement.setAttribute(
        "stroke",
        (this.options.stroke ?? (() => "black"))(this),
      );
    }
  }

  private drawTrail(trail: TrailBuffer, state: AppState): string {
    const size = trail.options.size / state.zoom.value;
    const _stroke = trail.getStrokeOutline(size).map((point: TrailPoint) => {
      const [x, y] = point;
      const result = sceneCoordsToViewportCoords(
        { sceneX: x, sceneY: y },
        state,
      );
      return [result.x, result.y];
    });
    const stroke = this.trailAnimation
      ? _stroke.slice(0, Math.ceil(_stroke.length / 2))
      : _stroke;
    return getSvgPathFromStroke(stroke, true);
  }
}
