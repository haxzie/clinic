import { RequestMethod, Response } from "@apiclinic/core";
import { Authorization, RequestBody } from "@apiclinic/core";
import { HeaderSchema, ParameterSchema } from "@apiclinic/core";

interface APIParmsExtras {
  isDisabled?: boolean;
  isReadonly?: boolean;
  source?: "environment" | "auth" | "custom";
}
export type RequestHeaders = Record<string, HeaderSchema & APIParmsExtras>;
export type RequestParameters = Record<
  string,
  ParameterSchema & APIParmsExtras
>;

// Representation of a path
export interface APISchema {
  id: string;
  collectionId: string;
  name: string;
  url: string;
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

