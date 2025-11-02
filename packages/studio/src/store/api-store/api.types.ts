import { APISchema, CollectionSchema, RequestHeaders } from "@/types/API.types";
import {
  Authorization,
  RequestBody,
  RequestMethod,
  RequestParameters,
} from "@apiclinic/core";

export type EnvironmentVariable = {
  id: string;
  name: string;
  value: string;
  isReadOnly?: boolean;
  isDisabled?: boolean;
};

export type EnvironmentData = {
  variables: Record<string, EnvironmentVariable>;
  headers: Record<string, EnvironmentVariable>;
};

export interface EnvironmentSchema {
  id: string;
  name: string;
  data: EnvironmentData;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface APIStoreState {
  apis: Record<string, APISchema>;
  collections: Record<string, CollectionSchema>;
  environments: Record<string, EnvironmentSchema>;
  activeEnvironmentId: string;

  initialize: () => Promise<void>;

  makeHTTPRequest: (apiId: string) => Promise<void>;
  setAPIStatus: (apiId: string, status: boolean) => void;
  createAPI: (api: Partial<APISchema>) => string;
  duplicateAPI: (id: string) => string;
  updateAPI: (id: string, api: Omit<Partial<APISchema>, "id">) => void;
  deleteAPI: (id: string) => void;

  // collections
  createCollection: (collection: Partial<CollectionSchema>) => string;
  duplicateCollection: (id: string) => string;
  updateCollection: (
    id: string,
    collection: Omit<Partial<CollectionSchema>, "id">
  ) => void;
  deleteCollection: (id: string) => void;

  // environments
  createEnvironment: (environment: Partial<EnvironmentSchema>) => string;
  updateEnvironment: (
    id: string,
    environment: Omit<Partial<EnvironmentSchema>, "id">
  ) => void;
  deleteEnvironment: (id: string) => void;
  setActiveEnvironment: (id: string) => void;
  getActiveEnvironment: () => EnvironmentSchema | null;

  // helpers
  setMethod: (apiId: string, method: RequestMethod) => void;
  setUrl: (apiId: string, url: string) => void;
  setDescription: (apiId: string, description: string) => void;
  setHeaders: (apiId: string, headers: RequestHeaders) => void;
  setParameters: (apiId: string, parameters: RequestParameters) => void;
  setRequestBody: (apiId: string, requestBody: RequestBody) => void;
  setAuthorization: (apiId: string, authorization: Authorization) => void;
}
