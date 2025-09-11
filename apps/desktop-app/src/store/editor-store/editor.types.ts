export const TabTypes = {
  API: "api",
  COLLECTION: "collection",
  SETTINGS: "settings",
} as const;
export type TabType = (typeof TabTypes)[keyof typeof TabTypes];

export interface TabSchema {
  id: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
  type: TabType;
}

export interface EditorState {
  activeTab: string | null;
  tabOrder: string[];
}
export interface EditorStoreState extends EditorState {
  tabs: Record<string, TabSchema>;

  initialize: () => Promise<void>;

  // actions
  setActiveTab: (tabId: string) => void;
  createTab: (
    tab: Partial<TabSchema> & { id: string; type: TabType }
  ) => TabSchema;
  updateTab: (id: string, tab: Omit<Partial<TabSchema>, "id">) => void;
  deleteTab: (id: string) => void;
}
