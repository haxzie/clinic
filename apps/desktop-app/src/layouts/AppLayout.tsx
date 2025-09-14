import React from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const handleTitlebarDoubleClick = async () => {
    try {
      const win = getCurrentWindow();
      await win.toggleMaximize();
    } catch {
      // No-op if window API is unavailable (e.g., running purely in web context)
    }
  };
  const handleTitlebarMouseDown = async (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (event.button !== 0) return; // only left-click initiates drag
    try {
      const win = getCurrentWindow();
      await win.startDragging();
    } catch {
      // No-op in non-tauri contexts
    }
  };
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div
        className="titlebar flex flex-row items-center justify-between h-[28px]"
        id="titlebar"
        data-tauri-drag-region="true"
        onMouseDown={handleTitlebarMouseDown}
        onDoubleClick={handleTitlebarDoubleClick}
      ></div>
      {children}
    </div>
  );
}
