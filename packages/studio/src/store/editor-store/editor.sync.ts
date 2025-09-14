import { tabStorage } from "@/lib/storage/db";
import { TabSchema } from "./editor.types";

export const handleCreateTab = async (tab: TabSchema) => {
  const newTab = await tabStorage.create({
    id: tab.id,
    data: tab,
  });
  return newTab;
};

export const handleUpdateTab = async (tab: TabSchema) => {
  const updatedTab = await tabStorage.update(tab.id, {
    id: tab.id,
    data: tab,
  });
  return updatedTab;
};

export const handleDeleteTab = async (tabId: string) => {
  await tabStorage.delete(tabId);
};