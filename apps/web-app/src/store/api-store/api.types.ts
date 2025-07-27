import { APISchema, CollectionSchema, RequestHeaders } from "@/types/API.types";
import {
  Authorization,
  RequestBody,
  RequestMethod,
  RequestParameters,
} from "@apiclinic/core";

export interface APIStoreState {
  apis: Record<string, APISchema>;
  collections: Record<string, CollectionSchema>;
  environment: string;

  makeHTTPRequest: (apiId: string) => Promise<void>;
  setAPIStatus: (apiId: string, status: boolean) => void;
  createAPI: (api: Partial<APISchema>) => string;
  updateAPI: (id: string, api: Omit<Partial<APISchema>, "id">) => void;
  deleteAPI: (id: string) => void;

  // collections
  createCollection: (collection: Partial<CollectionSchema>) => string;
  updateCollection: (
    id: string,
    collection: Omit<Partial<CollectionSchema>, "id">
  ) => void;
  deleteCollection: (id: string) => void;

  // helpers
  setMethod: (apiId: string, method: RequestMethod) => void;
  setUrl: (apiId: string, url: string) => void;
  setDescription: (apiId: string, description: string) => void;
  setHeaders: (apiId: string, headers: RequestHeaders) => void;
  setParameters: (apiId: string, parameters: RequestParameters) => void;
  setRequestBody: (apiId: string, requestBody: RequestBody) => void;
  setAuthorization: (apiId: string, authorization: Authorization) => void;
}
