import { create } from "zustand";
import { EditorStoreState, TabSchema } from "./editor.types";
import { StoredTabs, tabStorage } from "@/lib/storage/db";
import {
  handleCreateTab,
  handleDeleteTab,
  handleUpdateTab,
} from "./editor.sync";
import { StorageKeys } from "@/utils/constants";
import { LocalStore } from "@/lib/storage/local";

const getInitialState = () => ({
  tabs: {},
  tabOrder: [],
  activeTab: LocalStore.get(StorageKeys.lastActiveTab) || null,
});

export const useEditorStore = create<EditorStoreState>()((set, get) => ({
  ...getInitialState(),

  initialize: async () => {
    const tabs = await tabStorage.list();
    if (tabs.length === 0) {
      return;
    }
    const indexedTabs = tabs.reduce(
      (acc, tab) => {
        acc[tab.id] = tab.data;
        return acc;
      },
      {} as Record<string, StoredTabs["data"]>
    );

    const tabOrder = tabs
      .sort((a, b) => a.data.createdAt.localeCompare(b.data.createdAt))
      .map((tab) => tab.id);

    set({ tabs: indexedTabs, tabOrder });

    // set the last active tab
    const lastActiveTab = LocalStore.get(StorageKeys.lastActiveTab);
    if (lastActiveTab) {
      set({ activeTab: lastActiveTab });
    }
  },

  setActiveTab: (tabId) => {
    set({ activeTab: tabId });
    LocalStore.set(StorageKeys.lastActiveTab, tabId);
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
    const tab: TabSchema = {
      id: tabDetails.id,
      type: tabDetails.type,
      createdAt: new Date().toISOString(),
    };

    set({
      tabs: { ...get().tabs, [tab.id]: tab },
      tabOrder: [...get().tabOrder, tab.id],
      activeTab: tab.id,
    });

    handleCreateTab(tab);
    LocalStore.set(StorageKeys.lastActiveTab, tab.id);

    return tab;
  },

  updateTab: (id, tab) => {
    set({
      tabs: {
        ...get().tabs,
        [id]: { ...get().tabs[id], ...tab } as TabSchema,
      },
    });
    handleUpdateTab(get().tabs[id]);
  },

  deleteTab: (id) => {
    const { tabs, tabOrder } = get();
    delete tabs[id];
    let nextTab: string | null = null;
    // check if the tab is active
    if (get().activeTab === id) {
      // set the adjascent tab to the left if it exists or else the right one
      const index = tabOrder.indexOf(id);
      if (index > 0) {
        nextTab = tabOrder[index - 1];
      } else if (index < tabOrder.length - 1) {
        nextTab = tabOrder[index + 1];
      } else {
        // create a new tab
        nextTab = null;
      }
    }
    set({
      tabs,
      tabOrder: get().tabOrder.filter((tabId) => tabId !== id),
      activeTab: nextTab,
    });
    handleDeleteTab(id);
    if (nextTab) {
      LocalStore.set(StorageKeys.lastActiveTab, nextTab);
    } else {
      LocalStore.remove(StorageKeys.lastActiveTab);
    }
  },
}));
