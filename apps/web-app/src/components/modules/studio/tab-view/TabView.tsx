import React from "react";
import styles from "./TabView.module.scss";
import TopBar from "./top-bar/TopBar";
import APIEditor from "../api-editor/APIEditor";
import { useEditorStore } from "@/store/editor-store/editor.store";
import { useShallow } from "zustand/shallow";

export default function TabView() {
  const { activeTab } = useEditorStore(
    useShallow(({ tabs, activeTab }) => ({
      tabs,
      activeTab: activeTab ? tabs[activeTab]?.id : null,
    }))
  );
  return (
    <div id="tab-view" className={styles.tabView}>
      <TopBar />
      <div className={styles.content}>
        {activeTab && <APIEditor apiId={activeTab} />}
      </div>
    </div>
  );
}
