import {
  Authorization,
  AuthorizationTypes,
  RequestBody,
  RequestHeaders,
  RequestParameters,
} from "@apiclinic/core";
import { generateUUID } from "./dataUtils";
import { RequestMethod } from "@apiclinic/core";
import { APISchema } from "@/types/API.types";

export const ApiConstants = {};

export const AppConstants = {
  ROOT_API_PARENT_ID: "root",
  DEFAULT_REST_API_NAME: "Untitled API",
  DEFAULT_API_URL: "https://api.apico.dev/v1/BE15m1/users.list",
  DEFAULT_API_METHOD: "GET" as RequestMethod,
  DEFAULT_API_DESCRIPTION: `<h1>Untitled API</h1>
<p>This is an API description. You can use this space to describe the API, its purpose, and how to use it.</p>`,
  DEFAULT_API_AUTHORIZATION: {
    type: "None" as AuthorizationTypes.NONE,
    content: {},
  } as Authorization,
  DEFAULT_REQUEST_BODY: {
    contentType: "application/json",
    content: "{}",
  } as RequestBody,
  DEFAULT_API_PARAMETERS: {} as RequestParameters,
  DEFAULT_API_HEADERS: {} as RequestHeaders,
};

export const getDefaultRestApi = (): APISchema => {
  return {
    id: generateUUID("api"),
    parentId: AppConstants.ROOT_API_PARENT_ID,
    name: AppConstants.DEFAULT_REST_API_NAME,
    description: AppConstants.DEFAULT_API_DESCRIPTION,
    url: AppConstants.DEFAULT_API_URL,
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
