import { describe, expect, it } from "vitest";
import { newElement, newTextElement } from "@excalidraw/element";
import type { NonDeletedExcalidrawElement } from "@excalidraw/element/types";
import type { AppState } from "../../types";
import {
  isQuickAddHandleSupported,
  getQuickAddOriginShape,
  getQuickAddHandleOffset,
  getQuickAddHandlePositions,
  BUFFER_ZONE_THICKNESS,
} from "./utils";

function createRectangle(
  overrides: Partial<NonDeletedExcalidrawElement> = {},
): NonDeletedExcalidrawElement {
  return newElement({
    type: "rectangle",
    x: 0,
    y: 0,
    width: 100,
    height: 80,
    ...overrides,
  } as any) as NonDeletedExcalidrawElement;
}

function createDiamond(
  overrides: Partial<NonDeletedExcalidrawElement> = {},
): NonDeletedExcalidrawElement {
  return newElement({
    type: "diamond",
    x: 0,
    y: 0,
    width: 100,
    height: 80,
    ...overrides,
  } as any) as NonDeletedExcalidrawElement;
}

function createEllipse(
  overrides: Partial<NonDeletedExcalidrawElement> = {},
): NonDeletedExcalidrawElement {
  return newElement({
    type: "ellipse",
    x: 0,
    y: 0,
    width: 100,
    height: 80,
    ...overrides,
  } as any) as NonDeletedExcalidrawElement;
}

function createText(
  overrides: Partial<NonDeletedExcalidrawElement> & { containerId?: string } = {},
): NonDeletedExcalidrawElement {
  return newTextElement({
    x: 0,
    y: 0,
    text: "hello",
    ...overrides,
  }) as NonDeletedExcalidrawElement;
}

function makeAppState(overrides: Partial<AppState> = {}): AppState {
  return {
    width: 800,
    height: 600,
    offsetLeft: 0,
    offsetTop: 0,
    scrollX: 0,
    scrollY: 0,
    zoom: { value: 1 as any },
    ...overrides,
  } as AppState;
}

describe("QuickAddHandles utils", () => {
  describe("isQuickAddHandleSupported", () => {
    it("returns true for rectangle", () => {
      expect(isQuickAddHandleSupported(createRectangle())).toBe(true);
    });

    it("returns true for diamond", () => {
      expect(isQuickAddHandleSupported(createDiamond())).toBe(true);
    });

    it("returns true for ellipse", () => {
      expect(isQuickAddHandleSupported(createEllipse())).toBe(true);
    });

    it("returns false for locked rectangle", () => {
      expect(isQuickAddHandleSupported(createRectangle({ locked: true }))).toBe(
        false,
      );
    });

    it("returns false for arrow", () => {
      const arrow = newElement({
        type: "arrow",
        x: 0,
        y: 0,
        width: 100,
        height: 0,
        points: [[0, 0], [100, 0]],
      } as any) as NonDeletedExcalidrawElement;
      expect(isQuickAddHandleSupported(arrow)).toBe(false);
    });
  });

  describe("getQuickAddOriginShape", () => {
    it("returns the shape when selection is a supported shape", () => {
      const rect = createRectangle({ id: "rect-1" });
      const elementsMap = new Map([[rect.id, rect]]);
      expect(getQuickAddOriginShape(rect, elementsMap)).toBe(rect);
    });

    it("returns container when selection is bound text", () => {
      const rect = createRectangle({ id: "rect-1" });
      const text = createText({ id: "text-1", containerId: "rect-1" });
      const elementsMap = new Map([
        [rect.id, rect],
        [text.id, text],
      ]);
      expect(getQuickAddOriginShape(text, elementsMap)).toBe(rect);
    });

    it("returns null when container is not supported", () => {
      const arrow = newElement({
        type: "arrow",
        id: "arrow-1",
        x: 0,
        y: 0,
        width: 100,
        height: 0,
        points: [[0, 0], [100, 0]],
      } as any) as NonDeletedExcalidrawElement;
      const text = createText({ id: "text-1", containerId: "arrow-1" });
      const elementsMap = new Map([
        [arrow.id, arrow],
        [text.id, text],
      ]);
      expect(getQuickAddOriginShape(text, elementsMap)).toBeNull();
    });

    it("returns null when shape is locked", () => {
      const rect = createRectangle({ id: "rect-1", locked: true });
      const elementsMap = new Map([[rect.id, rect]]);
      expect(getQuickAddOriginShape(rect, elementsMap)).toBeNull();
    });
  });

  describe("getQuickAddHandleOffset", () => {
    it("returns at least 8", () => {
      expect(getQuickAddHandleOffset({ width: 10, height: 10 })).toBe(8);
    });

    it("returns 0.12 * min(width, height) when larger than 8", () => {
      expect(getQuickAddHandleOffset({ width: 100, height: 80 })).toBe(
        0.12 * 80,
      );
    });
  });

  describe("getQuickAddHandlePositions", () => {
    it("returns four handles (top, right, bottom, left)", () => {
      const rect = createRectangle();
      const appState = makeAppState();
      const positions = getQuickAddHandlePositions(rect, appState);
      expect(positions).toHaveLength(4);
      expect(positions.map((p) => p.side)).toEqual([
        "top",
        "right",
        "bottom",
        "left",
      ]);
    });

    it("each handle has radius and bufferThickness", () => {
      const rect = createRectangle();
      const appState = makeAppState();
      const positions = getQuickAddHandlePositions(rect, appState);
      positions.forEach((p) => {
        expect(p.radius).toBe(6);
        expect(p.bufferThickness).toBe(BUFFER_ZONE_THICKNESS);
        expect(typeof p.x).toBe("number");
        expect(typeof p.y).toBe("number");
      });
    });

    it("clamps positions to viewport", () => {
      const rect = createRectangle({ x: -500, y: -500 });
      const appState = makeAppState({ width: 100, height: 100 });
      const positions = getQuickAddHandlePositions(rect, appState);
      positions.forEach((p) => {
        expect(p.x).toBeGreaterThanOrEqual(6);
        expect(p.x).toBeLessThanOrEqual(94);
        expect(p.y).toBeGreaterThanOrEqual(6);
        expect(p.y).toBeLessThanOrEqual(94);
      });
    });
  });
});
