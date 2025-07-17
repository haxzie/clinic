import React, { useCallback } from "react";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";
import { AnimatePresence } from "motion/react";
import CollectionItem from "./CollectionItem";

export default function CollectionListView() {
  const { collections, createAPI, updateCollection } = useApiStore(
    useShallow(({ collections, createAPI, updateCollection }) => ({
      collections,
      createAPI,
      updateCollection,
    }))
  );

  const handleCreateAPIClick = (collectionId: string) => {
    createAPI({
      collectionId: collectionId,
    });
  };

  const handleNameChange = useCallback(
    (collectionId: string, value: string) => {
      updateCollection(collectionId, { name: value });
    },
    [updateCollection]
  );

  return (
    <AnimatePresence>
      {Object.values(collections).map((collection) => (
        <CollectionItem
          key={collection.id}
          collection={collection}
          onClickCreateAPI={handleCreateAPIClick}
          onNameChange={handleNameChange}
        />
      ))}
    </AnimatePresence>
  );
}
