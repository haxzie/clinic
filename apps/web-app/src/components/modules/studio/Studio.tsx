"use client";

import React, { useEffect } from "react";
import StudioLayout from "./studio-layout/StudioLayout";
import ExplorerPanel from "./explorer-panel/ExplorerPanel";
import TabView from "./tab-view/TabView";
import { setupShortcuts } from "@/utils/shortCuts";

export default function Studio() {
  useEffect(() => {
    document.addEventListener("keydown", setupShortcuts);
    return () => {
      document.removeEventListener("keydown", setupShortcuts);
    };
  }, []);
  return (
    <StudioLayout>
      <ExplorerPanel />
      <TabView />
    </StudioLayout>
  );
}
