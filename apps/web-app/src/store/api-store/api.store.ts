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
import { useEditorStore } from "../editor-store/editor.store";
import { prepareAuthorizationHeaders } from "@/utils/auth";

const getInitialState = () => {
  return {
    collections: {},
    apis: {},
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
    console.log("makeHTTPRequest", apiId);
    const api = get().apis[apiId];
    if (!api) {
      throw new Error(`API with id ${apiId} not found`);
    }
    // make http request
    try {
      // set the api status to loading
      get().setAPIStatus(apiId, true);
      const baseHeaders = Object.values(api.headers).reduce(
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

      // Apply authorization headers using the reusable function
      const authHeaders = prepareAuthorizationHeaders(api.authorization);
      const preparedHeaders = {
        ...baseHeaders,
        ...authHeaders,
      };

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

      // remove query params from the url
      const urlWithoutQueryParams = api.url.split("?")[0];
      const preparedUrl = urlWithoutQueryParams;

      // make the http request
      const response = await relayRequest({
        method: api.method,
        url: preparedUrl,
        headers: preparedHeaders,
        params: preparedParameters,
        body: api.requestBody,
      });

      // Handle the response
      if (response.status === "success" && response.response) {
        set((state) => ({
          apis: {
            ...state.apis,
            [apiId]: {
              ...state.apis[apiId],
              response: response.response,
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
        [newApi.id]: newApi,
        ...state.apis,
      },
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
    // check if any tab is using this api
    const { tabs } = useEditorStore.getState();
    const tabUsingAPI = Object.values(tabs).find((tab) => tab.id === id);
    if (tabUsingAPI) {
      // delete the tab using the tab id
      useEditorStore.getState().deleteTab(tabUsingAPI.id);
    }
    // delete the api
    set((state) => {
      const apis = { ...state.apis };
      delete apis[id];
      return { apis };
    });
  },

  setMethod: (apiId: string, method: RequestMethod) => {
    get().updateAPI(apiId, { method });
  },

  setUrl: (apiId: string, url: string) => {
    get().updateAPI(apiId, { url });
  },

  setDescription: (apiId: string, description: string) => {
    get().updateAPI(apiId, { description });
  },

  setHeaders: (apiId: string, headers: RequestHeaders) => {
    get().updateAPI(apiId, { headers });
  },

  setParameters: (apiId: string, parameters: RequestParameters) => {
    get().updateAPI(apiId, { parameters });
  },

  setRequestBody: (apiId: string, requestBody: RequestBody) => {
    get().updateAPI(apiId, { requestBody });
  },

  setAuthorization: (apiId: string, authorization: Authorization) => {
    get().updateAPI(apiId, { authorization });
  },

  createCollection: (collection) => {
    const newCollection = {
      ...collection,
      id: generateUUID("collection"),
      name: collection.name || "Untitled Collection",
      description: collection.description || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      collections: {
        ...state.collections,
        [newCollection.id]: newCollection,
      },
    }));
    return newCollection.id;
  },

  updateCollection: (id, collection) => {
    set((state) => ({
      collections: {
        ...state.collections,
        [id]: {
          ...state.collections[id],
          ...collection,
        },
      },
    }));
  },

  deleteCollection: (id) => {
    set((state) => {
      const collections = { ...state.collections };
      const apis = { ...state.apis };
      // delete all the apis in the collection
      Object.values(apis).forEach((api) => {
        if (api.collectionId === id) {
          get().deleteAPI(api.id);
        }
      });
      delete collections[id];
      return { collections, apis };
    });
  },
}));

export default useApiStore;
