import { create } from "zustand";
import { EditorStoreState, TabSchema } from "./editor.types";

const getInitialState = () => ({
  tabs: {},
  tabOrder: [],
  activeTab: null,
});

export const useEditorStore = create<EditorStoreState>()((set, get) => ({
  ...getInitialState(),

  setActiveTab: (tabId) => {
    set({ activeTab: tabId });
  },

  /**
   * Creates a new tab
   * 1. If the tab type is API and has no apiId, create a new API
   * 2. Create a new tab with the appropriate properties
   * 3. Set the active tab to the new tab
   * 4. Return the new tab
   * @param tab - The tab to create
   * @returns The created tab
   */
  createTab: (tabDetails) => {
    // check if the tab already exists
    const existingTab = Object.values(get().tabs).find(
      (tab) => tab.type === tabDetails.type && tab.id === tabDetails.id
    );
    if (existingTab) {
      set({ activeTab: existingTab.id });
      return existingTab;
    }

    // if the tab does not exist, create a new tab
    let tab: TabSchema = {
      id: tabDetails.id,
      type: tabDetails.type,
      createdAt: new Date().toISOString(),
    };

    set({
      tabs: { ...get().tabs, [tab.id]: tab },
      tabOrder: [...get().tabOrder, tab.id],
      activeTab: tab.id,
    });

    return tab;
  },

  updateTab: (id, tab) => {
    set({
      tabs: {
        ...get().tabs,
        [id]: { ...get().tabs[id], ...tab } as TabSchema,
      },
    });
  },

  deleteTab: (id) => {
    const { tabs, tabOrder } = get();
    delete tabs[id];
    // check if the tab is active
    if (get().activeTab === id) {
      // set the adjascent tab to the left if it exists or else the right one
      const index = tabOrder.indexOf(id);
      if (index > 0) {
        set({ activeTab: tabOrder[index - 1] });
      } else if (index < tabOrder.length - 1) {
        set({ activeTab: tabOrder[index + 1] });
      } else {
        // create a new tab
        set({ activeTab: null });
      }
    }
    set({
      tabs,
      tabOrder: get().tabOrder.filter((tabId) => tabId !== id),
    });
  },
}));
