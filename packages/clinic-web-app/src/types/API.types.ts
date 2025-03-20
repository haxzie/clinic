export interface Schema {
  type: string;
  properties?: {
    [key: string]: {
      type: string;
    };
  };
}

/**
 * Parameters
 */
export interface ParameterSchema {
  id: string;
  name: string;
  value: string;
}
export type Parameters = Record<string, ParameterSchema>;

/**
 * Headers
 */
export interface HeaderSchema {
  id: string;
  name: string;
  value: string;
}
export type Headers = Record<string, HeaderSchema>;

/**
 * Request Body
 */
export interface RequestBody {
  contentType: string | null; // application/json
  content?: string;
}

/**
 * Response
 */
export interface Response {
  headers: Headers;
  contentType: string | null;
  statusCode: number;
  content: {
    [key: string]: string | number | boolean | object;
  };
  performance: {
    duration: number;
    latency: number;
    processingTime?: number;
    transferTime: number;
    transferSize: number;
    transferEncoding: string;
  };
}

export enum AuthorizationTypes {
  NONE = "NONE",
  BASIC = "BASIC",
  BEARER = "BEARER",
  API_KEY = "API_KEY",
  OAUTH2 = "OAUTH2",
  CUSTOM = "CUSTOM",
}

export interface BasicAuthorization {
  type: AuthorizationTypes.BASIC;
  username: string;
  password: string;
}

export interface BearerAuthorization {
  type: AuthorizationTypes.BEARER;
  token: string;
}

export interface ApiKeyAuthorization {
  type: AuthorizationTypes.API_KEY;
  key: string;
}

export interface OAuth2Authorization {
  type: AuthorizationTypes.OAUTH2;
  token: string;
}

export interface CustomAuthorization {
  type: Authorization;
  token: string;
}

export interface Authorization {
  type: AuthorizationTypes;
  content: {
    [key in AuthorizationTypes]:
      | BasicAuthorization
      | BearerAuthorization
      | ApiKeyAuthorization
      | OAuth2Authorization
      | CustomAuthorization;
  };
}

// Representation of a path
export interface APISchema {
  id: string;
  parentId: string;
  name: string;
  path: string;
  method: string;
  description: string;
  parameters: Parameters;
  headers: Headers;
  requestBody: RequestBody;
  response?: Response;
  authorization: Authorization;
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
