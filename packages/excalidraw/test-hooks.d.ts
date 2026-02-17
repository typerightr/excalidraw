/**
 * Test hook types for window.h - provides proper typing for createTestHook in App.tsx.
 * Separate from global.d.ts to avoid circular imports and to give h.app, h.store, etc.
 * proper types (using any caused generic methods and callbacks to lose type inference).
 */
import type { Scene } from "./scene/types";
import type { ExcalidrawElement } from "@excalidraw/element/types";
import type { AppState } from "./types";
import type App from "./components/App";
import type { History } from "./history";
import type { Store } from "@excalidraw/element";

declare global {
  interface Window {
    h: {
      scene: Scene;
      elements: readonly ExcalidrawElement[];
      state: AppState;
      setState: React.Component<any, AppState>["setState"];
      watchState: (prev: any, next: any) => void | undefined;
      app: InstanceType<typeof App>;
      history: History;
      store: Store;
    };
  }
}

export {};
