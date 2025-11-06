import DeleteIcon from "@/components/icons/DeleteIcon";
import { APISchema } from "@/types/API.types";
import { motion } from "motion/react";
import React, { useCallback } from "react";
import { useShallow } from "zustand/shallow";
import styles from "./APIListView.module.scss";
import useApiStore from "@/store/api-store/api.store";
import { cn } from "@/utils/cn";
import EditableInputField from "../editable-input-field/EditableInputField";
import IconButton from "@/components/base/icon-button/IconButton";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import RequestIcon from "@/components/icons/RequestIcon";

export default function APIListItem({
  api,
  isActive,
  isContextMenuOpen,
  onClick,
  onContextMenu,
}: {
  api: APISchema;
  isActive: boolean;
  isContextMenuOpen: boolean;
  onClick: () => void;
  onContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: api.id,
    });
  const { updateAPI, deleteAPI } = useApiStore(
    useShallow(({ updateAPI, collections, deleteAPI }) => ({
      collections,
      updateAPI,
      deleteAPI,
    }))
  );

  const getClassForStatus = useCallback((statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return styles.success;
    } else if (statusCode >= 300 && statusCode < 400) {
      return styles.redirect;
    } else if (statusCode >= 400 && statusCode < 500) {
      return styles.clientError;
    } else if (statusCode >= 500) {
      return styles.serverError;
    }
    return styles.default;
  }, []);

  const handleNameChange = useCallback(
    (apiId: string, value: string) => {
      updateAPI(apiId, { name: value });
    },
    [updateAPI]
  );

  const handleDeleteAPI = useCallback(
    (apiId: string) => {
      deleteAPI(apiId);
    },
    [deleteAPI]
  );

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    console.log("context menu");
    event.preventDefault();
    event.stopPropagation();
    onContextMenu(event);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      layout
      ref={setNodeRef}
      style={
        transform
          ? {
              transform: CSS.Transform.toString(transform),
              zIndex: 1000,
            }
          : undefined
      }
      key={api.id}
      className={cn(
        styles.file,
        isActive && styles.active,
        isDragging && styles.dragging,
        isContextMenuOpen && styles.hover
      )}
      onClick={onClick}
      onContextMenu={handleContextMenu}
    >
      <div className={styles.texts}>
        <div className={styles.methodText} {...listeners} {...attributes}>
          <RequestIcon method={api.method} size={14} />
        </div>
        <div className={styles.name}>
          <EditableInputField
            value={api.name}
            onChange={(value) => {
              handleNameChange(api.id, value);
            }}
          />
        </div>
        <span
          className={`${styles.status} ${getClassForStatus(api.response?.statusCode || 0)}`}
        >
          {api.response?.statusCode}
        </span>
      </div>
      <div className={styles.deleteItem}>
        <IconButton
          size="small"
          tooltip="Delete"
          onClick={() => handleDeleteAPI(api.id)}
        >
          <DeleteIcon size={16} />
        </IconButton>
      </div>
    </motion.div>
  );
}
