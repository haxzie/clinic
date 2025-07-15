import React from "react";
import styles from "./FileTree.module.scss";
import APIListView from "./api-list-view/APIListView";
import CollectionListView from "./collection-list-view/CollectionListView";

export default function FileTree() {
  return (
    <div className={styles.fileTree}>
      <div className={styles.fileListing}>
        <CollectionListView />
        <APIListView collectionId={"root"} />
      </div>
    </div>
  );
}
