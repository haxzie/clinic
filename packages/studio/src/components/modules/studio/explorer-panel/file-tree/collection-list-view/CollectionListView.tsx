import React, { useCallback } from "react";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";
import { AnimatePresence } from "motion/react";
import CollectionItem from "./CollectionItem";
import { useEditorStore } from "@/store/editor-store/editor.store";
import { TabTypes } from "@/store/editor-store/editor.types";
import { useContextMenu } from "@/hooks/useContextMenu";
import DeleteIcon from "@/components/icons/DeleteIcon";
import CopyIcon from "@/components/icons/CopyIcon";
import AddIcon from "@/components/icons/AddIcon";

export default function CollectionListView() {
  const { open, isOpen } = useContextMenu({
    options: [
      {
        id: "add-request",
        label: "Add Request",
        icon: <AddIcon size={16}/>,
      },
      {
        id: "duplicate",
        label: "Duplicate",
        icon: <CopyIcon size={16}/>,
      },
      {
        id: "delete",
        label: "Delete",
        icon: <DeleteIcon size={16} />,
      },
    ],
  });
  const { collections, createAPI, updateCollection, deleteCollection, duplicateCollection } = useApiStore(
    useShallow(({ collections, createAPI, updateCollection, deleteCollection, duplicateCollection }) => ({
      collections,
      createAPI,
      updateCollection,
      deleteCollection,
      duplicateCollection,
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

  const handleContextMenu = (
    event: React.MouseEvent<HTMLDivElement>,
    collectionId: string
  ) => {
    event.preventDefault();
    event.stopPropagation();
    open(
      { x: event.clientX, y: event.clientY },
      {
        onSelect: (option) => {
          if (option.id === "add-request") {
            handleCreateAPIClick(collectionId);
          } else if (option.id === "duplicate") {
            duplicateCollection(collectionId);
          } else if (option.id === "delete") {
            deleteCollection(collectionId);
          }
        },
      }
    );
  };

  return (
    <AnimatePresence>
      {Object.values(collections).map((collection) => (
        <CollectionItem
          key={collection.id}
          collection={collection}
          isContextMenuOpen={isOpen}
          onClickCreateAPI={handleCreateAPIClick}
          onDeleteCollection={handleDeleteCollection}
          onNameChange={handleNameChange}
          onContextMenu={(event) => handleContextMenu(event, collection.id)}
        />
      ))}
    </AnimatePresence>
  );
}
