import React from "react";
import APIListView from "../api-list-view/APIListView";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/utils/cn";
import styles from "./CollectionListView.module.scss";

export default function RootApiListView() {
  const { isOver, setNodeRef } = useDroppable({
    id: "root",
  });
  return (
    <div
      ref={setNodeRef}
      className={cn(styles.rootApiListView, isOver && styles.over)}
    >
      <APIListView collectionId={"root"} />
    </div>
  );
}
