import React from "react";
import styles from "./ExplorerPanel.module.scss";
import LogoIcon from "@/components/icons/LogoIcon";
import FileTree from "./file-tree/FileTree";
import IconButton from "@/components/base/icon-button/IconButton";
import AddIcon from "@/components/icons/AddIcon";
import AddFolderIcon from "@/components/icons/AddFolderIcon";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";
import { useEditorStore } from "@/store/editor-store/editor.store";
import { TabTypes } from "@/store/editor-store/editor.types";

export default function ExplorerPanel() {
  const { createAPI, createCollection } = useApiStore(
    useShallow(({ createAPI, createCollection }) => ({
      createAPI,
      createCollection,
    }))
  );

  const { createTab } = useEditorStore(
    useShallow(({ createTab }) => ({ createTab }))
  );

  const handleCreateNewRequest = () => {
    const apiId = createAPI({});
    createTab({ id: apiId, type: TabTypes.API });
  };

  const handleCreateNewCollection = () => {
    createCollection({});
  };

  return (
    <div id="sidebar" className={styles.navigationWrapper}>
      {/* <NavigationBar /> */}
      <div className={styles.explorerPanel}>
        <div className={styles.listHeader}>
          <h4 className={styles.title}>
            <div className={styles.logo}>
              <LogoIcon size={20} />
            </div>
            clinic
          </h4>
          <div className={styles.options}>
            <IconButton
              size="small"
              tooltip="Create Collection"
              tooltipPosition="bottom"
              onClick={handleCreateNewCollection}
              className={styles.optionIcon}
            >
              <AddFolderIcon size={16} />
            </IconButton>
            <IconButton
              size="small"
              tooltip="New Request"
              tooltipPosition="bottom"
              onClick={handleCreateNewRequest}
              className={styles.optionIcon}
            >
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
