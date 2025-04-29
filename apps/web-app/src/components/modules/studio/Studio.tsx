"use client";

import React from "react";
import StudioLayout from "./studio-layout/StudioLayout";
import ExplorerPanel from "./explorer-panel/ExplorerPanel";
import TabView from "./tab-view/TabView";

export default function Studio() {
  return (
    <StudioLayout>
      <ExplorerPanel />
      <TabView />
    </StudioLayout>
  );
}
