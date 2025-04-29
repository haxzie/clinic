import { create } from "zustand";
// import { devtools } from "zustand/middleware";
import { EditorStoreState, Tab, TabType } from "./editor.types";
import useApiStore from "../api-store/api.store";

const initialState = {
  tabs: {},
  activeTab: null,
};

/**
 * Editor store
 */
const useEditorStore = create<EditorStoreState>()((set, get) => ({
  ...initialState,
  /**
   * Set the active tab
   * @param id
   */
  setActiveTab: (id: string | null) => {
    set((state) => ({ ...state, activeTab: id }));
  },

  /**
   *  Add a tab
   * @param tab
   */
  createTab: ({ name, type, metadata }: Omit<Tab, "id">) => {
    if (type === TabType.REST) {
      const apiId = useApiStore.getState().createAPI({});

      const newTab: Tab = {
        id: apiId,
        name,
        type,
        metadata: { ...metadata, apiId },
        isLoading: false,
      };

      set((state) => ({
        tabs: {
          ...state.tabs,
          [apiId]: newTab,
        },
        activeTab: apiId,
      }));
    }
  },
  removeTab: (id) => {
    // check if the tab is active
    const { tabs: oldTabs, activeTab } = get();
    const tabs = { ...oldTabs };
    delete tabs[id];
    // find a new active tab
    if (activeTab === id) {
      const tabIds = Object.keys(tabs);
      const newActiveTab = tabIds.length ? tabIds[tabIds.length - 1] : null;
      set({ tabs, activeTab: newActiveTab });
    } else {
      set({ tabs });
    }
  },
  updateTab: (id, tab) => {
    set((state) => ({
      tabs: {
        ...state.tabs,
        [id]: tab,
      },
    }));
  },
  clearTabs: () => {
    set({ activeTab: null, tabs: {} });
  },
}));

export default useEditorStore;
