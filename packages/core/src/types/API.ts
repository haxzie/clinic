/**
 * Parameters
 */
export interface ParameterSchema {
  id: string;
  name: string;
  value: string;
}
export type RequestParameters = Record<string, ParameterSchema>;

/**
 * Headers
 */
export interface HeaderSchema {
  id: string;
  name: string;
  value: string;
}
export type RequestHeaders = Record<string, HeaderSchema>;
export type ResponseHeaders = Record<string, HeaderSchema>;

/**
 * Request Body
 */
export interface RequestBody {
  contentType: string | null; // application/json
  content?: string;
}

export const AuthorizationTypes = {
  NONE: "NONE",
  BASIC: "BASIC",
  BEARER: "BEARER",
  API_KEY: "API_KEY",
  OAUTH2: "OAUTH2",
  CUSTOM: "CUSTOM",
} as const;
export type AuthorizationType =
  (typeof AuthorizationTypes)[keyof typeof AuthorizationTypes];

export interface BasicAuthorization {
  type: typeof AuthorizationTypes.BASIC;
  username: string;
  password: string;
}

export interface BearerAuthorization {
  type: typeof AuthorizationTypes.BEARER;
  token: string;
}

export interface ApiKeyAuthorization {
  type: typeof AuthorizationTypes.API_KEY;
  key: string;
}

export interface OAuth2Authorization {
  type: typeof AuthorizationTypes.OAUTH2;
  token: string;
}

export interface CustomAuthorization {
  type: typeof AuthorizationTypes.CUSTOM;
  token: string;
}

export interface NoAuthorization {
  type: typeof AuthorizationTypes.NONE;
}

export type Authorization =
  | BasicAuthorization
  | BearerAuthorization
  | ApiKeyAuthorization
  | OAuth2Authorization
  | CustomAuthorization
  | NoAuthorization;

export const RequestMethods = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
  OPTIONS: "OPTIONS",
  HEAD: "HEAD",
} as const;
export type RequestMethodType = keyof typeof RequestMethods;
export type RequestMethod = (typeof RequestMethods)[RequestMethodType];

export type ResponsePerformance = {
  duration: number;
  latency: number;
  processingTime: number;
  transferTime: number;
  transferSize: number;
  transferEncoding: string;
};

export interface Request {
  url: string;
  method: RequestMethod;
  headers: Record<string, unknown>;
  body: RequestBody;
  params: Record<string, unknown>;
}

export interface Response {
  headers: ResponseHeaders;
  contentType: string | null;
  statusCode: number;
  content: string;
  performance: ResponsePerformance;
}
