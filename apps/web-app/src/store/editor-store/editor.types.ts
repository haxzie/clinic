export enum TabType {
  REST = "REST",
}

export interface Tab {
  id: string;
  name: string;
  type: TabType;
  metadata: Record<string, string | number | boolean | object>;
  isLoading?: boolean;
}

export type Tabs = Record<string, Tab>;

export interface EditorStoreState {
  tabs: Tabs;
  activeTab: string | null;
  // actions
  setActiveTab: (id: string | null) => void;
  createTab: (tab: Omit<Tab, "id">) => void;
  removeTab: (id: string) => void;
  updateTab: (id: string, tab: Tab) => void;
  clearTabs: () => void;
}
