import React, { useCallback, useRef, useState } from "react";
import { COLOR_PALETTE } from "@excalidraw/common";
import { getTooltipDiv, updateTooltipPosition } from "../Tooltip";
import {
  getQuickAddHandlePositions,
  type HandleViewportPosition,
  type QuickAddSide,
} from "./utils";
import type { NonDeletedExcalidrawElement } from "@excalidraw/element/types";
import type { AppState } from "../../types";

import "./QuickAddHandles.scss";

const QUICK_ADD_HANDLE_BLUE = COLOR_PALETTE.blue[2];

const TOOLTIP_DELAY_MS = 300;
const TOOLTIP_LABEL = "Add shape";

export type QuickAddHandlesProps = {
  originShape: NonDeletedExcalidrawElement;
  appState: AppState;
  onActivate: (side: QuickAddSide, originShapeId: string) => void;
};

function Handle({
  position,
  originShapeId,
  onActivate,
}: {
  position: HandleViewportPosition;
  originShapeId: string;
  onActivate: (side: QuickAddSide, originShapeId: string) => void;
}) {
  const [hoveredOrFocused, setHoveredOrFocused] = useState(false);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleRef = useRef<HTMLButtonElement>(null);

  const showTooltip = useCallback(() => {
    const tooltip = getTooltipDiv();
    tooltip.classList.add("excalidraw-tooltip--visible");
    tooltip.textContent = TOOLTIP_LABEL;
    if (handleRef.current) {
      const rect = handleRef.current.getBoundingClientRect();
      updateTooltipPosition(tooltip, rect, "top");
    }
  }, []);

  const hideTooltip = useCallback(() => {
    tooltipTimerRef.current && clearTimeout(tooltipTimerRef.current);
    tooltipTimerRef.current = null;
    getTooltipDiv().classList.remove("excalidraw-tooltip--visible");
  }, []);

  const scheduleTooltip = useCallback(() => {
    tooltipTimerRef.current = setTimeout(showTooltip, TOOLTIP_DELAY_MS);
  }, [showTooltip]);

  const handlePointerEnter = useCallback(() => {
    setHoveredOrFocused(true);
    scheduleTooltip();
  }, [scheduleTooltip]);

  const handlePointerLeave = useCallback(() => {
    setHoveredOrFocused(false);
    hideTooltip();
  }, [hideTooltip]);

  const handleFocus = useCallback(() => {
    setHoveredOrFocused(true);
    scheduleTooltip();
  }, [scheduleTooltip]);

  const handleBlur = useCallback(() => {
    setHoveredOrFocused(false);
    hideTooltip();
  }, [hideTooltip]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onActivate(position.side, originShapeId);
      }
    },
    [onActivate, position.side, originShapeId],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
    },
    [],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onActivate(position.side, originShapeId);
    },
    [onActivate, position.side, originShapeId],
  );

  const { x, y, radius, bufferThickness } = position;
  const hitSize = Math.max(radius * 2 + bufferThickness, 44);
  const left = x - hitSize / 2;
  const top = y - hitSize / 2;

  return (
    <button
      ref={handleRef}
      type="button"
      className="quick-add-handle"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: hitSize,
        height: hitSize,
        // So handle stays clickable in packaged builds when consumer CSS is purged
        position: "absolute",
        pointerEvents: "auto",
        cursor: "pointer",
      }}
      onPointerDown={handlePointerDown}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      aria-label={TOOLTIP_LABEL}
      title={TOOLTIP_LABEL}
    >
      <span
        className="quick-add-handle__hit"
        style={{
          width: hitSize,
          height: hitSize,
        }}
      />
      <span
        className={`quick-add-handle__icon ${
          hoveredOrFocused ? "quick-add-handle__icon--plus" : ""
        }`}
        style={{
          width: radius * 2,
          height: radius * 2,
          marginLeft: -radius,
          marginTop: -radius,
        }}
      >
        <span className="quick-add-handle__circle" />
        <span className="quick-add-handle__plus" aria-hidden>
          <svg width="24" height="24" viewBox="0 0 14 14" fill="none">
            <circle
              cx="7"
              cy="7"
              r="5.5"
              stroke="currentColor"
              strokeWidth="1.75"
              fill="none"
            />
            <path
              d="M7 4.5v5M4.5 7h5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="square"
            />
          </svg>
        </span>
      </span>
    </button>
  );
}

export function QuickAddHandles({
  originShape,
  appState,
  onActivate,
}: QuickAddHandlesProps) {
  const positions = getQuickAddHandlePositions(originShape, appState);

  return (
    <div
      className="quick-add-handles"
      aria-hidden
      style={
        {
          "--quick-add-handle-color": QUICK_ADD_HANDLE_BLUE,
          // Critical layout so handles show in packaged builds when consumer CSS is purged
          position: "absolute",
          inset: 0,
          zIndex: 20,
          pointerEvents: "none",
        } as React.CSSProperties
      }
    >
      {positions.map((pos) => (
        <Handle
          key={pos.side}
          position={pos}
          originShapeId={originShape.id}
          onActivate={onActivate}
        />
      ))}
    </div>
  );
}
