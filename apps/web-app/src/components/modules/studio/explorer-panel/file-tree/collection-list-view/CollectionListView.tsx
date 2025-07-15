import React, { useState } from "react";
import styles from "./CollectionListView.module.scss";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";
import ChevronRightIcon from "@/components/icons/ChevronRightIcon";
import IconButton from "@/components/base/icon-button/IconButton";
import AddIcon from "@/components/icons/AddIcon";
import APIListView from "../api-list-view/APIListView";

export default function CollectionListView() {
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(
    null
  );

  const { collections, createAPI } = useApiStore(
    useShallow(({ collections, createAPI }) => ({
      collections,
      createAPI,
    }))
  );

  const handleCollectionAPIClick = (collectionId: string) => {
    createAPI({
      collectionId: collectionId,
    });
  };

  return (
    <>
      {Object.values(collections).map((collection) => (
        <div className={styles.collectionWrapper} key={collection.id}>
          <div
            className={styles.folder}
            onClick={() => setActiveCollectionId(collection.id)}
          >
            <div className={styles.icon}>
              <ChevronRightIcon size={18} />
            </div>
            <h4 className={styles.folderName}>{collection.name}</h4>
            <div className={styles.options}>
              <IconButton
                size="small"
                tooltip="Add Request"
                onClick={() => handleCollectionAPIClick(collection.id)}
              >
                <AddIcon size={16} />
              </IconButton>
            </div>
          </div>
          {activeCollectionId === collection.id && (
            <div className={styles.collectionContent}>
              <APIListView collectionId={collection.id} />
            </div>
          )}
        </div>
      ))}
    </>
  );
}
