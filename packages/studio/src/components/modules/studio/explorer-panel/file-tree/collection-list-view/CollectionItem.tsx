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
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/utils/cn";
import { Events, track } from "@/lib/analytics";

function CollectionItem({
  collection,
  isContextMenuOpen,
  onClickCreateAPI,
  onNameChange,
  onDeleteCollection,
  onContextMenu,
}: {
  collection: CollectionSchema;
  isContextMenuOpen: boolean;
  onClickCreateAPI: (collectionId: string) => void;
  onNameChange: (collectionId: string, value: string) => void;
  onDeleteCollection: (collectionId: string) => void;
  onContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
}) {
  const [showContent, setShowContent] = useState(false);
  const { isOver, setNodeRef } = useDroppable({
    id: collection.id,
  });

  const handleCollectionClick = () => {
    setShowContent((showContent) => !showContent);
    
    // Track COLLECTION_VIEWED event when collection is clicked
    track(Events.COLLECTION_VIEWED, {});
  };

  const handleCreateAPIClick = useCallback(
    (collectionId: string) => {
      setShowContent(true);
      onClickCreateAPI(collectionId);
    },
    [onClickCreateAPI]
  );

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onContextMenu(event);
  };

  return (
    <motion.div className={styles.collectionWrapper} key={collection.id}>
      <div
        className={cn(styles.folder, isOver && styles.over, isContextMenuOpen && styles.hover)}
        onClick={handleCollectionClick}
        onContextMenu={handleContextMenu}
        ref={setNodeRef}
      >
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
