import React from "react";
import styles from "./TabView.module.scss";
import TopBar from "./top-bar/TopBar";
import APIEditor from "../api-editor/APIEditor";

export default function TabView() {

  return (
    <div id="tab-view" className={styles.tabView}>
      <TopBar />
      <div className={styles.content}>
        <APIEditor />
      </div>
    </div>
  );
}
