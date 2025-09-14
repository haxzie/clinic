import React, { useMemo } from "react";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";
import { AnimatePresence } from "motion/react";
import { useEditorStore } from "@/store/editor-store/editor.store";
import { TabTypes } from "@/store/editor-store/editor.types";
import APIListItem from "./APIListItem";

export default function APIListView({
  collectionId = "root",
}: {
  collectionId: string;
}) {
  const { activeTab } = useEditorStore(
    useShallow(({ activeTab }) => ({ activeTab }))
  );
  const { apis } = useApiStore(
    useShallow(({ apis }) => ({
      apis,
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

  return (
    <AnimatePresence>
      {filteredAPIs.map((api) => (
        <APIListItem
          key={api.id}
          api={api}
          isActive={activeTab === api.id}
          onClick={() => {
            createTab({ type: TabTypes.API, id: api.id });
          }}
        />
      ))}
    </AnimatePresence>
  );
}
