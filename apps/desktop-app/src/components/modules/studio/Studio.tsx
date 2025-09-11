"use client";

import { useEffect, useState } from "react";
import StudioLayout from "./studio-layout/StudioLayout";
import ExplorerPanel from "./explorer-panel/ExplorerPanel";
import TabView from "./tab-view/TabView";
import { setupShortcuts } from "@/utils/shortCuts";
import useApiStore from "@/store/api-store/api.store";
import { useEditorStore } from "@/store/editor-store/editor.store";

export default function Studio() {
  const [isInitialized, setIsInitialized] = useState(false);
  const initializeAPIs = useApiStore((state) => state.initialize);
  const initializeEditor = useEditorStore((state) => state.initialize);

  const initialize = async () => {
    await initializeAPIs();
    await initializeEditor();
    setIsInitialized(true);
  };

  useEffect(() => {
    if (isInitialized) return;
    initialize();
  }, [isInitialized]);

  useEffect(() => {
    document.addEventListener("keydown", setupShortcuts);
    return () => {
      document.removeEventListener("keydown", setupShortcuts);
    };
  }, []);

  return isInitialized ? (
    <StudioLayout>
      <ExplorerPanel />
      <TabView />
    </StudioLayout>
  ) : (
    <div className="flex h-full w-full items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );
}
