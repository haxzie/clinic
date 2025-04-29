import {
  RequestHeaders,
  RequestMethod,
  RequestParameters,
  Response
} from "@apiclinic/core";
import { Authorization, RequestBody } from "@apiclinic/core";

// Representation of a path
export interface APISchema {
  id: string;
  parentId: string;
  name: string;
  path: string;
  method: RequestMethod;
  description: string;
  parameters: RequestParameters;
  headers: RequestHeaders;
  requestBody: RequestBody;
  response?: Response;
  authorization: Authorization;
  isLoading?: boolean;
  isSaved?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionSchema {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
