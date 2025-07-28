import useApiStore from "@/store/api-store/api.store";
import { TabSchema, TabTypes } from "@/store/editor-store/editor.types";
import React from "react";
import { useShallow } from "zustand/react/shallow";

export default function TabName({ tab }: { tab: TabSchema }) {
  const { activeAPI } = useApiStore(
    useShallow(({ apis }) => ({
      activeAPI:
        tab.type === TabTypes.API
          ? apis[tab.id]
          : tab.type === TabTypes.COLLECTION
            ? apis[tab.id]
            : undefined,
    }))
  );

  if (tab.type === TabTypes.API && activeAPI) {
    return <span>{activeAPI.name}</span>;
  } else {
    return <span>untitled api</span>;
  }
}
