import {
  APISchema,
  Authorization,
  AuthorizationTypes,
  Headers,
  RequestBody,
} from "@/types/API.types";
import { generateUUID } from "./dataUtils";

export const ApiConstants = {};

export const AppConstants = {
  ROOT_API_PARENT_ID: "root",
  DEFAULT_REST_API_NAME: "Untitled API",
  DEFAULT_API_PATH: "https://api.clinic.dev/ping",
  DEFAULT_API_METHOD: "GET",
  DEFAULT_API_DESCRIPTION: `<h1>Untitled API</h1>
<p>This is an API description. You can use this space to describe the API, its purpose, and how to use it.</p>`,
  DEFAULT_API_AUTHORIZATION: {
    type: AuthorizationTypes.NONE,
    content: {},
  } as Authorization,
  DEFAULT_REQUEST_BODY: {
    contentType: "application/json",
    content: "{}",
  } as RequestBody,
  DEFAULT_API_PARAMETERS: {},
  DEFAULT_API_HEADERS: {},
};

export const getDefaultRestApi = (): APISchema => {
  return {
    id: generateUUID("api"),
    parentId: AppConstants.ROOT_API_PARENT_ID,
    name: AppConstants.DEFAULT_REST_API_NAME,
    description: AppConstants.DEFAULT_API_DESCRIPTION,
    path: AppConstants.DEFAULT_API_PATH,
    method: AppConstants.DEFAULT_API_METHOD,
    authorization: AppConstants.DEFAULT_API_AUTHORIZATION,
    parameters: AppConstants.DEFAULT_API_PARAMETERS,
    headers: AppConstants.DEFAULT_API_HEADERS,
    requestBody: AppConstants.DEFAULT_REQUEST_BODY,
    response: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
