import { useEffect, useState } from "react";
import StudioLayout from "./studio-layout/StudioLayout";
import ExplorerPanel from "./explorer-panel/ExplorerPanel";
import TabView from "./tab-view/TabView";
import { setupShortcuts } from "@/utils/shortCuts";
import useApiStore from "@/store/api-store/api.store";
import { useEditorStore } from "@/store/editor-store/editor.store";
import {} from "@/hooks/useContextMenu";

export function Studio() {
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
    if (!setupShortcuts || !globalThis.document) return;
    const { document: doc } = globalThis;
    doc.addEventListener("keydown", setupShortcuts);
    return () => doc.removeEventListener("keydown", setupShortcuts);
  }, [setupShortcuts]);

  return isInitialized ? (
    <StudioLayout>
      <ExplorerPanel />
      <TabView />
    </StudioLayout>
  ) : (
    <></>
  );
}
