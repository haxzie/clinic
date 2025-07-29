import React, { useCallback, useMemo } from "react";
import styles from "./APIListView.module.scss";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";
import EditableInputField from "../editable-input-field/EditableInputField";
import { AnimatePresence, motion } from "motion/react";
import IconButton from "@/components/base/icon-button/IconButton";
import DeleteIcon from "@/components/icons/DeleteIcon";
import { useEditorStore } from "@/store/editor-store/editor.store";
import { TabTypes } from "@/store/editor-store/editor.types";
import { cn } from "@/utils/cn";

export default function APIListView({
  collectionId = "root",
}: {
  collectionId: string;
}) {
  const { activeTab } = useEditorStore(
    useShallow(({ activeTab }) => ({ activeTab }))
  );
  const { apis, updateAPI, deleteAPI } = useApiStore(
    useShallow(({ apis, updateAPI, collections, deleteAPI }) => ({
      collections,
      apis,
      updateAPI,
      deleteAPI,
    }))
  );

  const { createTab } = useEditorStore(
    useShallow(({ createTab }) => ({ createTab }))
  );

  const filteredAPIs = useMemo(() => {
    return Object.values(apis).filter((api) => {
      return api.collectionId === collectionId;
    });
  }, [apis, collectionId]);

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

  return (
    <AnimatePresence>
      {filteredAPIs.map((api) => (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          layout
          key={api.id}
          className={cn(styles.file, activeTab === api.id && styles.active)}
          onClick={() => {
            createTab({ type: TabTypes.API, id: api.id });
          }}
        >
          <div className={styles.texts}>
            <div className={[styles.methodText].join(" ")}>{api.method}</div>
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
            <div className={styles.deleteItem}>
              <IconButton
                size="small"
                tooltip="Delete"
                onClick={() => handleDeleteAPI(api.id)}
              >
                <DeleteIcon size={16} />
              </IconButton>
            </div>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
