import { create } from "zustand";
// import { devtools } from "zustand/middleware";
import { APIStoreState } from "./api.types";
import { getDefaultRestApi } from "@/utils/constants";
import { getRequestClient } from "@/provider/StudioProvider";
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
import {
  apiStorage,
  collectionStorage,
  StoredAPI,
  StoredCollection,
} from "@/lib/storage/db";
import { handleCreateAPI, handleCreateCollection, handleDeleteAPI, handleDeleteCollection, handleUpdateAPI, handleUpdateCollection } from "./api.sync";
import { Events, track } from "@/lib/analytics";

const getInitialState = () => {
  return {
    collections: {},
    apis: {},
    environment: "development",
  };
};

const useApiStore = create<APIStoreState>()((set, get) => ({
  ...getInitialState(),

  initialize: async () => {
    const apis = await apiStorage.list();
    const savedAPIs = apis.reduce(
      (acc, api) => {
        acc[api.id] = api.data;
        return acc;
      },
      {} as Record<string, StoredAPI["data"]>
    );

    const collections = await collectionStorage.list();
    const savedCollections = collections.reduce(
      (acc, collection) => {
        acc[collection.id] = collection.data;
        return acc;
      },
      {} as Record<string, StoredCollection["data"]>
    );

    set({ apis: savedAPIs, collections: savedCollections });
  },

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
      const baseHeaders = Object.values(api.headers).reduce((acc, value) => {
        if (value.isDisabled) {
          return acc;
        }
        return {
          ...acc,
          [value.name]: value.value,
        };
      }, {});

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
      const response = await getRequestClient().relayRequest({
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

        // Track API_HIT event with detailed properties
        const isLocalServer = api.url.includes('localhost') || api.url.includes('127.0.0.1') || api.url.includes('::1');
        const headerCount = Object.keys(preparedHeaders).length;
        const queryParamCount = Object.keys(preparedParameters).length;
        const requestBodyType = api.requestBody.contentType || 'none';
        const authorizationType = api.authorization.type || 'none';

        track(Events.API_HIT, {
          method: api.method,
          response_status: response.response.statusCode,
          response_content_type: response.response.contentType || 'unknown',
          is_local_server: isLocalServer,
          header_count: headerCount,
          query_param_count: queryParamCount,
          request_body_type: requestBodyType,
          authorization_type: authorizationType,
        });
      } else if (response.status === "error") {
        // Create a synthetic error response
        const errorResponse = {
          headers: {},
          contentType: "text/plain",
          statusCode: 0,
          content: response.message || "Request failed",
          performance: {
            duration: 0,
            latency: 0,
            processingTime: 0,
            transferTime: 0,
            transferSize: 0,
            transferEncoding: "identity",
          },
        };

        set((state) => ({
          apis: {
            ...state.apis,
            [apiId]: {
              ...state.apis[apiId],
              response: errorResponse,
            },
          },
        }));

        // Track failed API request
        track(Events.API_HIT, {
          method: api.method,
          response_status: 0,
          response_content_type: 'error',
          is_local_server: false,
          header_count: Object.keys(preparedHeaders).length,
          query_param_count: Object.keys(preparedParameters).length,
          request_body_type: api.requestBody.contentType || 'none',
          authorization_type: api.authorization.type || 'none',
        });
      }
    } catch (error) {
      console.error(error);
      
      // Store the caught exception as an error response
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorResponse = {
        headers: {},
        contentType: "text/plain",
        statusCode: 0,
        content: `Request Error: ${errorMessage}`,
        performance: {
          duration: 0,
          latency: 0,
          processingTime: 0,
          transferTime: 0,
          transferSize: 0,
          transferEncoding: "identity",
        },
      };

      set((state) => ({
        apis: {
          ...state.apis,
          [apiId]: {
            ...state.apis[apiId],
            response: errorResponse,
          },
        },
      }));
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
    handleUpdateAPI(get().apis[apiId]);
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
    handleCreateAPI(newApi);
    
    // Track API_CREATED event
    track(Events.API_CREATED, {});
    
    return newApi.id;
  },

  duplicateAPI: (id) => {
    const api = get().apis[id];
    if (!api) {
      throw new Error(`API with id ${id} not found`);
    }

    // Create a new API with the same properties but a new ID and name
    const newApiId = generateUUID("api");
    const duplicatedApi = {
      ...api,
      id: newApiId,
      name: `${api.name} (Copy)`,
      response: undefined, // Clear the response for the duplicated API
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      apis: {
        [newApiId]: duplicatedApi,
        ...state.apis,
      },
    }));
    handleCreateAPI(duplicatedApi);

    // Track API_DUPLICATED event
    track(Events.API_DUPLICATED, {});

    return newApiId;
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
    handleUpdateAPI(get().apis[id]);
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
    handleDeleteAPI(id);
    
    // Track API_DELETED event
    track(Events.API_DELETED, {});
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
    handleCreateCollection(newCollection);
    
    // Track COLLECTION_CREATED event
    track(Events.COLLECTION_CREATED, {});
    
    return newCollection.id;
  },

  duplicateCollection: (id) => {
    const collection = get().collections[id];
    if (!collection) {
      throw new Error(`Collection with id ${id} not found`);
    }

    // Create a new collection with the same properties but a new ID and name
    const newCollectionId = generateUUID("collection");
    const duplicatedCollection = {
      ...collection,
      id: newCollectionId,
      name: `${collection.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      collections: {
        ...state.collections,
        [newCollectionId]: duplicatedCollection,
      },
    }));
    handleCreateCollection(duplicatedCollection);

    // Duplicate all APIs in the collection
    const apisInCollection = Object.values(get().apis).filter(
      (api) => api.collectionId === id
    );
    apisInCollection.forEach((api) => {
      const duplicatedApiId = generateUUID("api");
      const duplicatedApi = {
        ...api,
        id: duplicatedApiId,
        collectionId: newCollectionId,
        response: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((state) => ({
        apis: {
          ...state.apis,
          [duplicatedApiId]: duplicatedApi,
        },
      }));
      handleCreateAPI(duplicatedApi);
    });

    // Track COLLECTION_DUPLICATED event
    track(Events.COLLECTION_DUPLICATED, {});

    return newCollectionId;
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
    handleUpdateCollection(get().collections[id]);
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
    handleDeleteCollection(id);
    
    // Track COLLECTION_DELETED event
    track(Events.COLLECTION_DELETED, {});
  },
}));

export default useApiStore;
