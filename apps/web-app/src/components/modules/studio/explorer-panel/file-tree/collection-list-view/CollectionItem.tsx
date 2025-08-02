import { motion } from "motion/react";
import styles from "./CollectionListView.module.scss";
import { AnimatePresence } from "motion/react";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import ChevronRightIcon from "@/components/icons/ChevronRightIcon";
import EditableInputField from "../editable-input-field/EditableInputField";
import AddIcon from "@/components/icons/AddIcon";
import IconButton from "@/components/base/icon-button/IconButton";
import APIListView from "../api-list-view/APIListView";
import { CollectionSchema } from "@/types/API.types";
import { memo, useCallback, useState } from "react";
import FolderIcon from "@/components/icons/FolderIcon";
import DeleteIcon from "@/components/icons/DeleteIcon";

function CollectionItem({
  collection,
  onClickCreateAPI,
  onNameChange,
  onDeleteCollection,
}: {
  collection: CollectionSchema;
  onClickCreateAPI: (collectionId: string) => void;
  onNameChange: (collectionId: string, value: string) => void;
  onDeleteCollection: (collectionId: string) => void;
}) {
  const [showContent, setShowContent] = useState(false);
  const handleCollectionClick = () => {
    setShowContent((showContent) => !showContent);
  };

  const handleCreateAPIClick = useCallback(
    (collectionId: string) => {
      setShowContent(true);
      onClickCreateAPI(collectionId);
    },
    [onClickCreateAPI]
  );

  return (
    <motion.div className={styles.collectionWrapper} key={collection.id}>
      <div className={styles.folder} onClick={handleCollectionClick}>
        <div className={styles.icon}>
          {showContent ? (
            <ChevronDownIcon size={18} />
          ) : (
            <ChevronRightIcon size={18} />
          )}
          <FolderIcon size={18} />
        </div>
        <EditableInputField
          value={collection.name}
          onChange={(value) => {
            onNameChange(collection.id, value);
          }}
        />
        <div className={styles.options}>
          <IconButton
            size="small"
            tooltip="Add Request"
            onClick={() => onDeleteCollection(collection.id)}
          >
            <DeleteIcon size={16} />
          </IconButton>
          <IconButton
            size="small"
            tooltip="Add Request"
            onClick={() => handleCreateAPIClick(collection.id)}
          >
            <AddIcon size={16} />
          </IconButton>
        </div>
      </div>
      <AnimatePresence>
        {showContent && (
          <motion.div
            className={styles.collectionContent}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <APIListView collectionId={collection.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default memo(CollectionItem);
