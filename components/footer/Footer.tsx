import clsx from "clsx";
import type { ReactNode } from "react";

import { TOOL_TYPE } from "@excalidraw/common";
import type { EditorInterface } from "@excalidraw/common";

import { actionShortcuts } from "../../actions";
import { isHandToolActive } from "../../appState";
import { useTunnels } from "../../context/tunnels";
import { t } from "../../i18n";
import {
  ExitZenModeButton,
  ShapesSwitcher,
  UndoRedoActions,
  ZoomActions,
} from "../Actions";
import { HandButton } from "../HandButton";
import { HelpButton } from "../HelpButton";
import { HintViewer } from "../HintViewer";
import { Island } from "../Island";
import { LaserPointerButton } from "../LaserPointerButton";
import { LockButton } from "../LockButton";
import { PenModeButton } from "../PenModeButton";
import { Section } from "../Section";
import Stack from "../Stack";

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

const Footer = ({
  appState,
  actionManager,
  showExitZenModeBtn,
  renderWelcomeScreen,
  footerCenterContent,
  setAppState,
  onLockToggle,
  onHandToolToggle,
  onPenModeToggle,
  UIOptions,
  app,
  isCollaborating,
  editorInterface,
  spacing,
  isCompactStylesPanel,
}: {
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
}) => {
  const {
    FooterCenterTunnel,
    WelcomeScreenHelpHintTunnel,
    WelcomeScreenToolbarHintTunnel,
  } = useTunnels();

  return (
    <footer
      role="contentinfo"
      className="layer-ui__wrapper__footer App-menu App-menu_bottom drawing-footer"
    >
      <div
        className={clsx("layer-ui__wrapper__footer-left zen-mode-transition", {
          "layer-ui__wrapper__footer-left--transition-left":
            appState.zenModeEnabled,
        })}
      >
        <Stack.Col gap={2}>
          <Section heading="canvasActions">
            <ZoomActions
              renderAction={actionManager.renderAction}
              zoom={appState.zoom}
            />

            {!appState.viewModeEnabled && (
              <UndoRedoActions
                renderAction={actionManager.renderAction}
                className={clsx("zen-mode-transition", {
                  "layer-ui__wrapper__footer-left--transition-bottom":
                    appState.zenModeEnabled,
                })}
              />
            )}
          </Section>
        </Stack.Col>
      </div>
      <div
        className={clsx("zen-mode-transition", {
          "layer-ui__wrapper__footer-left--transition-bottom":
            appState.zenModeEnabled,
        })}
      >
        {!appState.viewModeEnabled &&
          appState.openDialog?.name !== "elementLinkSelector" && (
            <Section
              heading="shapes"
              className="shapes-section App-menu_bottom_center"
            >
              {(heading: React.ReactNode) => (
                <div style={{ position: "relative" }}>
                  {renderWelcomeScreen && (
                    <WelcomeScreenToolbarHintTunnel.Out />
                  )}
                  <Stack.Col gap={spacing.toolbarColGap} align="start">
                    <Stack.Row
                      gap={spacing.toolbarRowGap}
                      className={clsx("App-toolbar-container", {
                        "zen-mode": appState.zenModeEnabled,
                      })}
                    >
                      <Island
                        padding={spacing.islandPadding}
                        className={clsx("App-toolbar", {
                          "zen-mode": appState.zenModeEnabled,
                          "App-toolbar--compact": isCompactStylesPanel,
                        })}
                      >
                        <HintViewer
                          appState={appState}
                          isMobile={editorInterface.formFactor === "phone"}
                          editorInterface={editorInterface}
                          app={app}
                        />
                        {heading}
                        <Stack.Row gap={spacing.toolbarInnerRowGap}>
                          <PenModeButton
                            zenModeEnabled={appState.zenModeEnabled}
                            checked={appState.penMode}
                            onChange={() => onPenModeToggle(null)}
                            title={t("toolBar.penMode")}
                            penDetected={appState.penDetected}
                          />
                          <LockButton
                            checked={appState.activeTool.locked}
                            onChange={onLockToggle}
                            title={t("toolBar.lock")}
                          />

                          <div className="App-toolbar__divider" />

                          <HandButton
                            checked={isHandToolActive(appState)}
                            onChange={() => onHandToolToggle()}
                            title={t("toolBar.hand")}
                            isMobile
                          />

                          <ShapesSwitcher
                            setAppState={setAppState}
                            activeTool={appState.activeTool}
                            UIOptions={UIOptions}
                            app={app}
                          />
                        </Stack.Row>
                      </Island>
                      {isCollaborating && (
                        <Island
                          style={{
                            marginLeft: spacing.collabMarginLeft,
                            alignSelf: "center",
                            height: "fit-content",
                          }}
                        >
                          <LaserPointerButton
                            title={t("toolBar.laser")}
                            checked={
                              appState.activeTool.type === TOOL_TYPE.laser
                            }
                            onChange={() =>
                              app.setActiveTool({ type: TOOL_TYPE.laser })
                            }
                            isMobile
                          />
                        </Island>
                      )}
                    </Stack.Row>
                  </Stack.Col>
                </div>
              )}
            </Section>
          )}

      </div>

      <div
        className={clsx("layer-ui__wrapper__footer-right zen-mode-transition", {
          "transition-right": appState.zenModeEnabled,
        })}
      >
        <div style={{ position: "relative" }}>
          {renderWelcomeScreen && <WelcomeScreenHelpHintTunnel.Out />}
          <HelpButton
            onClick={() => actionManager.executeAction(actionShortcuts)}
          />
        </div>
      </div>
      <ExitZenModeButton
        actionManager={actionManager}
        showExitZenModeBtn={showExitZenModeBtn}
      />
    </footer>
  );
};

export default Footer;
Footer.displayName = "Footer";
