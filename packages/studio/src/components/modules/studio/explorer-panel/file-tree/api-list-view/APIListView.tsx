import React, { useMemo } from "react";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";
import { AnimatePresence } from "motion/react";
import { useEditorStore } from "@/store/editor-store/editor.store";
import { TabTypes } from "@/store/editor-store/editor.types";
import APIListItem from "./APIListItem";
import { useContextMenu } from "@/hooks/useContextMenu";
import DeleteIcon from "@/components/icons/DeleteIcon";
import CopyIcon from "@/components/icons/CopyIcon";

export default function APIListView({
  collectionId = "root",
}: {
  collectionId: string;
}) {
  const { open, isOpen } = useContextMenu({
    options: [
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
  const { activeTab } = useEditorStore(
    useShallow(({ activeTab }) => ({ activeTab }))
  );
  const { apis, deleteAPI, duplicateAPI } = useApiStore(
    useShallow(({ apis, deleteAPI, duplicateAPI }) => ({
      apis,
      deleteAPI,
      duplicateAPI,
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

  const handleContextMenu = (
    event: React.MouseEvent<HTMLDivElement>,
    apiId: string
  ) => {
    event.preventDefault();
    event.stopPropagation();
    open(
      { x: event.clientX, y: event.clientY },
      {
        onSelect: (option) => {
          if (option.id === "duplicate") {
            const newApiId = duplicateAPI(apiId);
            createTab({ type: TabTypes.API, id: newApiId });
          } else if (option.id === "delete") {
            deleteAPI(apiId);
          }
        },
      }
    );
  };

  return (
    <AnimatePresence>
      {filteredAPIs.map((api) => (
        <APIListItem
          key={api.id}
          api={api}
          isActive={activeTab === api.id}
          isContextMenuOpen={isOpen}
          onClick={() => {
            createTab({ type: TabTypes.API, id: api.id });
          }}
          onContextMenu={(event) => handleContextMenu(event, api.id)}
        />
      ))}
    </AnimatePresence>
  );
}
