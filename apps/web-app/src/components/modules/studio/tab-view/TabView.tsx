import React from "react";
import styles from "./TabView.module.scss";
import { useShallow } from "zustand/shallow";
import TopBar from "./top-bar/TopBar";
import APIEditor from "../api-editor/APIEditor";
import useApiStore from "@/store/api-store/api.store";

export default function TabView() {
  const { activeAPI } = useApiStore(
    useShallow(({ activeAPI }) => ({ activeAPI }))
  );

  return (
    <div id="tab-view" className={styles.tabView}>
      <TopBar />
      <div className={styles.content}>
        <APIEditor apiId={activeAPI} />
      </div>
    </div>
  );
}
