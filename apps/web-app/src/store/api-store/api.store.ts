import { create } from "zustand";
// import { devtools } from "zustand/middleware";
import { APIStoreState } from "./api.types";
import { getDefaultRestApi } from "@/utils/constants";
import { relayRequest } from "@/services/clinic-server/relay";
import { generateUUID } from "@/utils/dataUtils";
import {
  Authorization,
  RequestBody,
  RequestHeaders,
  RequestMethod,
  RequestParameters,
} from "@apiclinic/core";
import { extractAPINameFromURL } from "@/utils/requestUtils";

const getInitialState = () => {
  const defaultAPIId = generateUUID("api");
  const defaultAPI = getDefaultRestApi();
  return {
    activeAPI: defaultAPIId,
    apis: {
      [defaultAPIId]: {
        ...defaultAPI,
        id: defaultAPIId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    environment: "development",
  };
};

const useApiStore = create<APIStoreState>()((set, get) => ({
  ...getInitialState(),

  /**
   * Makes an HTTP request to the specified API and updates the state with the response.
   *
   * @TODO - Move this to a separate service
   * @param apiId - The ID of the API to make the request for
   * @returns {Promise<void>} - A promise that resolves when the request is complete
   */
  makeHTTPRequest: async (apiId) => {
    const api = get().apis[apiId];
    if (!api) {
      throw new Error(`API with id ${apiId} not found`);
    }
    // make http request
    try {
      // set the api status to loading
      get().setAPIStatus(apiId, true);
      const preparedHeaders = Object.values(api.headers).reduce(
        (acc, value) => {
          if (value.isDisabled) {
            return acc;
          }
          return {
            ...acc,
            [value.name]: value.value,
          };
        },
        {}
      );

      const preparedParameters = Object.values(api.parameters).reduce(
        (acc, value) => {
          if (value.isDisabled) {
            return acc;
          }
          return {
            ...acc,
            [value.name]: value.value,
          };
        },
        {}
      );
      // make the http request
      const { status, data } = await relayRequest({
        method: api.method,
        url: api.url,
        headers: preparedHeaders,
        params: preparedParameters,
        body: api.requestBody,
      });

      // update the api response
      if (status === 200 && data && data.response) {
        set((state) => ({
          apis: {
            ...state.apis,
            [apiId]: {
              ...state.apis[apiId],
              response: data.response,
            },
          },
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      // set the api status to not loading
      get().setAPIStatus(apiId, false);
      if (api.name === "Untitled API") {
        console.log("API name is untitled, updating it to the URL path");
        // get the path of the url
        const name = extractAPINameFromURL(api.url);
        get().updateAPI(apiId, { name });
      }
    }
  },

  /**
   * Sets the active API in the store.
   * */
  setActiveAPI: (apiId) => {
    set(() => ({
      activeAPI: apiId,
    }));
  },

  setAPIStatus: (apiId, status) => {
    set((state) => ({
      apis: {
        ...state.apis,
        [apiId]: {
          ...state.apis[apiId],
          isLoading: status,
        },
      },
    }));
  },

  createAPI: (api) => {
    const defaultApi = getDefaultRestApi();
    const newApi = {
      ...defaultApi,
      ...api,
    };
    set((state) => ({
      apis: {
        ...state.apis,
        [newApi.id]: newApi,
      },
      activeAPI: newApi.id,
    }));
    return newApi.id;
  },

  updateAPI: (id, api) => {
    set((state) => ({
      apis: {
        ...state.apis,
        [id]: {
          ...state.apis[id],
          ...api,
        },
      },
    }));
  },

  deleteAPI: (id) => {
    set((state) => {
      const apis = { ...state.apis };
      delete apis[id];
      return { apis };
    });
  },

  setMethod: (method: RequestMethod) => {
    get().updateAPI(get().activeAPI, { method });
  },

  setUrl: (url: string) => {
    get().updateAPI(get().activeAPI, { url });
  },

  setDescription: (description: string) => {
    get().updateAPI(get().activeAPI, { description });
  },

  setHeaders: (headers: RequestHeaders) => {
    get().updateAPI(get().activeAPI, { headers });
  },

  setParameters: (parameters: RequestParameters) => {
    get().updateAPI(get().activeAPI, { parameters });
  },

  setRequestBody: (requestBody: RequestBody) => {
    get().updateAPI(get().activeAPI, { requestBody });
  },

  setAuthorization: (authorization: Authorization) => {
    get().updateAPI(get().activeAPI, { authorization });
  },
}));

export default useApiStore;
