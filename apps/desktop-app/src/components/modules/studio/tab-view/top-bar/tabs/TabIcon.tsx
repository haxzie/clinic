import { TabSchema, TabTypes } from "@/store/editor-store/editor.types";
import React from "react";
import APIStatusIcon from "../../api-details/api-status-icon/APIStatusIcon";
// import { useEditorStore } from "@/store/editor-store/editor.store";
import { useShallow } from "zustand/react/shallow";
import useApiStore from "@/store/api-store/api.store";
import SearchIcon from "@/components/icons/SearchIcon";

export default function TabIcon({ tab }: { tab: TabSchema }) {
  const { type } = tab;
  const { activeAPI } = useApiStore(
    useShallow(({ apis }) => ({
      activeAPI:
        type === TabTypes.API
          ? apis[tab.id]
          : type === TabTypes.COLLECTION
            ? apis[tab.id]
            : undefined,
    }))
  );

  if (type === "api" && activeAPI) {
    return <APIStatusIcon status={activeAPI?.response?.statusCode} />;
  } else {
    return <SearchIcon size={16} />;
  }
}
