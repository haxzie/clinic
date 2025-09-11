import React from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import styles from "./StudioLayout.module.scss";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const handleTitlebarDoubleClick = async () => {
    try {
      const win = getCurrentWindow();
      await win.toggleMaximize();
    } catch {
      // No-op if window API is unavailable (e.g., running purely in web context)
    }
  };
  const handleTitlebarMouseDown = async (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return; // only left-click initiates drag
    try {
      const win = getCurrentWindow();
      await win.startDragging();
    } catch {
      // No-op in non-tauri contexts
    }
  };
  return (
    <div className={styles.studioLayout}>
      <div
        className={[styles.titleBar, "titlebar"].join(" ")}
        id="titlebar"
        data-tauri-drag-region="true"
        onMouseDown={handleTitlebarMouseDown}
        onDoubleClick={handleTitlebarDoubleClick}
      ></div>
      <div className={styles.studioContent}>{children}</div>
    </div>
  );
}
