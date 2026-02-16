import React from "react";
import { vi } from "vitest";
import { waitFor } from "@testing-library/react";

import { Excalidraw } from "../index";

import { API } from "./helpers/api";
import { act, render, GlobalTestState } from "./test-utils";

describe("QuickAddHandles", () => {
  it("calls onQuickAddHandleActivate with side and originShapeId when a handle is clicked", async () => {
    const onActivate = vi.fn();
    await render(
      <Excalidraw onQuickAddHandleActivate={onActivate} />,
    );

    const rect = API.createElement({
      type: "rectangle",
      x: 100,
      y: 100,
      width: 100,
      height: 80,
    });
    API.setElements([rect]);
    API.setSelectedElements([rect]);

    const { container } = GlobalTestState.renderResult!;
    let handles: NodeListOf<Element>;
    await waitFor(() => {
      handles = container.querySelectorAll(".quick-add-handle");
      expect(handles.length).toBe(4);
    });

    (container.querySelector(".quick-add-handle") as HTMLElement).click();

    expect(onActivate).toHaveBeenCalledTimes(1);
    const [side, originShapeId] = onActivate.mock.calls[0];
    expect(["top", "right", "bottom", "left"]).toContain(side);
    expect(originShapeId).toBe(rect.id);
  });

  it("calls onQuickAddHandleActivate when Enter is pressed on focused handle", async () => {
    const onActivate = vi.fn();
    await render(
      <Excalidraw onQuickAddHandleActivate={onActivate} />,
    );

    const rect = API.createElement({
      type: "rectangle",
      x: 100,
      y: 100,
      width: 100,
      height: 80,
    });
    API.setElements([rect]);
    API.setSelectedElements([rect]);

    const { container } = GlobalTestState.renderResult!;
    let firstHandle: HTMLButtonElement | null = null;
    await waitFor(() => {
      firstHandle = container.querySelector(".quick-add-handle");
      expect(firstHandle).not.toBeNull();
    });

    act(() => {
      firstHandle!.focus();
      const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
      firstHandle!.dispatchEvent(event);
    });

    expect(onActivate).toHaveBeenCalledTimes(1);
    const [side, originShapeId] = onActivate.mock.calls[0];
    expect(["top", "right", "bottom", "left"]).toContain(side);
    expect(originShapeId).toBe(rect.id);
  });

  it("does not render handles when onQuickAddHandleActivate is not provided", async () => {
    await render(<Excalidraw />);

    const rect = API.createElement({
      type: "rectangle",
      x: 100,
      y: 100,
      width: 100,
      height: 80,
    });
    API.setElements([rect]);
    API.setSelectedElements([rect]);

    const { container } = GlobalTestState.renderResult!;
    const handles = container.querySelectorAll(".quick-add-handles");
    expect(handles.length).toBe(0);
  });

  it("does not render handles when multiple elements are selected", async () => {
    const onActivate = vi.fn();
    await render(
      <Excalidraw onQuickAddHandleActivate={onActivate} />,
    );

    const rect1 = API.createElement({
      type: "rectangle",
      x: 0,
      y: 0,
      width: 50,
      height: 50,
    });
    const rect2 = API.createElement({
      type: "rectangle",
      x: 100,
      y: 0,
      width: 50,
      height: 50,
    });
    API.setElements([rect1, rect2]);
    API.setSelectedElements([rect1, rect2]);

    const { container } = GlobalTestState.renderResult!;
    const handles = container.querySelectorAll(".quick-add-handle");
    expect(handles.length).toBe(0);
  });
});
