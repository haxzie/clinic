import React from "react";
import styles from "./FileTree.module.scss";
import CollectionListView from "./collection-list-view/CollectionListView";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import useApiStore from "@/store/api-store/api.store";
import RootApiListView from "./collection-list-view/RootApiListView";
export default function FileTree() {
  const handleDragEnd = (event: DragEndEvent) => {
    console.log(event);
    document.body.style.cursor = "default";
    const { active, over } = event;
    if (active.id && over?.id) {
      useApiStore.getState().updateAPI(active.id as string, {
        collectionId: over?.id as string,
      });
    }
  };

  const handleDragStart = () => {
    document.body.style.cursor = "grabbing";
  };

  return (
    <div className={styles.fileTree}>
      <div className={styles.fileListing}>
        <DndContext
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
          onDragStart={handleDragStart}
        >
          <CollectionListView />
          <RootApiListView />
        </DndContext>
      </div>
    </div>
  );
}
