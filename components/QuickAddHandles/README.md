# Quick-Add Handles

Quick-add handles are circular controls shown at the midpoints of a single selected shape (rectangle, diamond, ellipse) or sticky note. They allow the host app to add a new shape in a chosen direction relative to the origin shape.

## API

### `onQuickAddHandleActivate`

Pass this callback on the main `<Excalidraw>` component to enable quick-add handles and receive activation events:

```ts
onQuickAddHandleActivate?: (
  side: "top" | "right" | "bottom" | "left",
  originShapeId: string,
) => void;
```

- **`side`** – Which handle was activated: the side of the shape (in the shape’s local frame) that the user clicked or activated via keyboard.
- **`originShapeId`** – The `id` of the shape that was selected when the handle was activated (the “origin” shape).

When a handle is activated, the **library** creates the new shape using the same defaults and behavior as the toolbar: same type (rectangle, diamond, ellipse, or sticky note) and attributes (colors, stroke, etc.), and for sticky notes it starts text editing so the user can type immediately. The callback is invoked **after** the new shape has been created, so you can use it for analytics or app-specific side effects.

Example:

```tsx
<Excalidraw
  onQuickAddHandleActivate={(side, originShapeId) => {
    // Optional: analytics or app-specific side effects.
    console.log(`Add shape ${side} of ${originShapeId}`);
  }}
/>
```

Handles are only rendered when this prop is provided. If it is `undefined`, no quick-add handles are shown.

## Visibility rules

Quick-add handles are **shown** only when all of the following are true:

- **Single selection or text focused** – Exactly one element is selected (the shape or its bound text), or the user is editing text inside a shape/sticky (the container is the origin).
- **Supported shape** – The selected/focused element is a rectangle (including sticky note), diamond, or ellipse, or is bound text whose container is one of those; the origin shape is not locked.
- **No ongoing operations** – The user is not resizing, rotating, or dragging the selection.
- **Callback provided** – `onQuickAddHandleActivate` is passed to `<Excalidraw>`.

Handles are **hidden** when:

- More than one element is selected.
- The selected element (or its container, if bound text) is not a supported shape or is locked.
- The user is resizing, rotating, or dragging (handles remain visible while editing text inside a shape).
- `onQuickAddHandleActivate` is not provided.

## Behavior

- **Position** – Handles are placed at the midpoints of each side of the shape, offset outward by `max(8, 0.12 * min(width, height))`, in the shape’s local coordinate system (they rotate with the shape). Positions are clamped so handles stay within the viewport.
- **Hover / focus** – Over the handle or its buffer zone (~22px), the circle morphs to a plus icon and a tooltip “Add shape” appears after 300 ms.
- **Activation** – Click, or focus the handle and press **Enter** or **Space**, to call `onQuickAddHandleActivate(side, originShapeId)`.
