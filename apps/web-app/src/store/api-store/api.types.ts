import { APISchema, RequestHeaders } from "@/types/API.types";
import {
  Authorization,
  RequestBody,
  RequestMethod,
  RequestParameters,
} from "@apiclinic/core";

export interface APIStoreState {
  activeAPI: string;
  apis: Record<string, APISchema>;
  environment: string;

  // actions
  setActiveAPI: (apiId: string) => void;
  makeHTTPRequest: (apiId: string) => Promise<void>;
  setAPIStatus: (apiId: string, status: boolean) => void;
  createAPI: (api: Partial<APISchema>) => string;
  updateAPI: (id: string, api: Omit<Partial<APISchema>, "id">) => void;
  deleteAPI: (id: string) => void;

  // helpers
  setMethod: (method: RequestMethod) => void;
  setUrl: (url: string) => void;
  setDescription: (description: string) => void;
  setHeaders: (headers: RequestHeaders) => void;
  setParameters: (parameters: RequestParameters) => void;
  setRequestBody: (requestBody: RequestBody) => void;
  setAuthorization: (authorization: Authorization) => void;
}
