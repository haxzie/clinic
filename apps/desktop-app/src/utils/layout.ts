import { PanelGroupStorage } from "react-resizable-panels";

export const getResizablePanelStorage = (): PanelGroupStorage => ({
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
});
