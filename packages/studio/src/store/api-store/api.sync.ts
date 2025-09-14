import { apiStorage, collectionStorage } from "@/lib/storage/db";
import { APISchema, CollectionSchema } from "@/types/API.types";

export const handleCreateAPI = async (api: APISchema) => {
  const newAPI = await apiStorage.create({
    id: api.id,
    data: api,
  });
  return newAPI;
};

export const handleUpdateAPI = async (api: APISchema) => {
  const updatedAPI = await apiStorage.update(api.id, {
    id: api.id,
    data: api,
  });
  return updatedAPI;
};

export const handleDeleteAPI = async (apiId: string) => {
  await apiStorage.delete(apiId);
};

export const handleCreateCollection = async (collection: CollectionSchema) => {
  const newCollection = await collectionStorage.create({
    id: collection.id,
    data: collection,
  });
  return newCollection;
};

export const handleUpdateCollection = async (collection: CollectionSchema) => {
  const updatedCollection = await collectionStorage.update(collection.id, {
    id: collection.id,
    data: collection,
  });
  return updatedCollection;
};

export const handleDeleteCollection = async (collectionId: string) => {
  await collectionStorage.delete(collectionId);
};