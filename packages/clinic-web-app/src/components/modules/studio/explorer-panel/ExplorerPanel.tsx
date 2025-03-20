import React from "react";
import styles from "./ExplorerPanel.module.scss";
import LogoIcon from "@/components/icons/LogoIcon";
import FileTree from "./file-tree/FileTree";
import IconButton from "@/components/base/icon-button/IconButton";
import AddIcon from "@/components/icons/AddIcon";
import AddFolderIcon from "@/components/icons/AddFolderIcon";
import SearchIcon from "@/components/icons/SearchIcon";

export default function ExplorerPanel() {
  return (
    <div id="sidebar" className={styles.navigationWrapper}>
      {/* <NavigationBar /> */}
      <div className={styles.explorerPanel}>
        <div className={styles.header}>
          <div className={styles.icon}>
            <LogoIcon size={20} />
          </div>
          {/* <div className={styles.title}>Clinic</div> */}
        </div>
        <div className={styles.listHeader}>
          <h4 className={styles.title}>APIs</h4>
          <div className={styles.options}>
            <IconButton size="small" tooltip="Search">
              <SearchIcon size={16} />
            </IconButton>
            <IconButton size="small" tooltip="Create Collection">
              <AddFolderIcon size={16} />
            </IconButton>
            <IconButton size="small" tooltip="New Request">
              <AddIcon size={16} />
            </IconButton>
          </div>
        </div>
        {/* <SearchBar /> */}
        <FileTree />
      </div>
    </div>
  );
}
