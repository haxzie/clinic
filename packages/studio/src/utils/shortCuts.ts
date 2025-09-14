import useApiStore from "@/store/api-store/api.store";
import { useEditorStore } from "@/store/editor-store/editor.store";
import { TabTypes } from "@/store/editor-store/editor.types";

const altKeyShortcuts: Record<string, () => void> = {
  KeyN: () => {
    const apiId = useApiStore.getState().createAPI({});
    useEditorStore.getState().createTab({ id: apiId, type: TabTypes.API });
  },
};

export const setupShortcuts = (event: KeyboardEvent) => {
  // New request
  const { altKey, code } = event;
  if (altKey) {
    if (code in altKeyShortcuts) {
      event.preventDefault();
      altKeyShortcuts[code]();
    }
  }
};
