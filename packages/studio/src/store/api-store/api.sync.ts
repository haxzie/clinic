import { apiStorage, collectionStorage, environmentStorage } from "@/lib/storage/db";
import { APISchema, CollectionSchema } from "@/types/API.types";
import { EnvironmentSchema } from "./api.types";

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

export const handleCreateEnvironment = async (environment: EnvironmentSchema) => {
  const newEnvironment = await environmentStorage.create({
    id: environment.id,
    data: environment,
  });
  return newEnvironment;
};

export const handleUpdateEnvironment = async (environment: EnvironmentSchema) => {
  const updatedEnvironment = await environmentStorage.update(environment.id, {
    id: environment.id,
    data: environment,
  });
  return updatedEnvironment;
};

export const handleDeleteEnvironment = async (environmentId: string) => {
  await environmentStorage.delete(environmentId);
};