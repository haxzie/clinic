import React, { useCallback } from "react";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";
import { AnimatePresence } from "motion/react";
import CollectionItem from "./CollectionItem";
import { useEditorStore } from "@/store/editor-store/editor.store";
import { TabTypes } from "@/store/editor-store/editor.types";

export default function CollectionListView() {
  const { collections, createAPI, updateCollection, deleteCollection } = useApiStore(
    useShallow(({ collections, createAPI, updateCollection, deleteCollection }) => ({
      collections,
      createAPI,
      updateCollection,
      deleteCollection,
    }))
  );
  const { createTab } = useEditorStore(
    useShallow(({ createTab }) => ({
      createTab,
    }))
  );

  const handleCreateAPIClick = (collectionId: string) => {
    const apiId = createAPI({
      collectionId: collectionId,
    });
    createTab({
      id: apiId,
      type: TabTypes.API,
    });
  };

  const handleNameChange = useCallback(
    (collectionId: string, value: string) => {
      updateCollection(collectionId, { name: value });
    },
    [updateCollection]
  );

  const handleDeleteCollection = (collectionId: string) => {
    deleteCollection(collectionId);
  };

  return (
    <AnimatePresence>
      {Object.values(collections).map((collection) => (
        <CollectionItem
          key={collection.id}
          collection={collection}
          onClickCreateAPI={handleCreateAPIClick}
          onDeleteCollection={handleDeleteCollection}
          onNameChange={handleNameChange}
        />
      ))}
    </AnimatePresence>
  );
}
