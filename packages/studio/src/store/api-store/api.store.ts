import { create } from "zustand";
// import { devtools } from "zustand/middleware";
import { APIStoreState, EnvironmentSchema } from "./api.types";
import { getDefaultRestApi } from "@/utils/constants";
import { getRequestClient } from "@/provider/StudioProvider";
import { generateUUID } from "@/utils/dataUtils";
import {
  Authorization,
  RequestBody,
  RequestMethod,
} from "@apiclinic/core";
import { RequestHeaders, RequestParameters } from "@/types/API.types";
import { extractAPINameFromURL } from "@/utils/requestUtils";
import { useEditorStore } from "../editor-store/editor.store";
import { prepareAuthorizationHeaders } from "@/utils/auth";
import { prepareRequestWithVariables, replaceVariables } from "@/utils/variableReplacer";
import {
  apiStorage,
  collectionStorage,
  environmentStorage,
  StoredAPI,
  StoredCollection,
  StoredEnvironment,
} from "@/lib/storage/db";
import {
  handleCreateAPI,
  handleCreateCollection,
  handleDeleteAPI,
  handleDeleteCollection,
  handleUpdateAPI,
  handleUpdateCollection,
  handleCreateEnvironment,
  handleUpdateEnvironment,
  handleDeleteEnvironment,
} from "./api.sync";
import { Events, track } from "@/lib/analytics";

const DEFAULT_ENV_ID = "default";

const createDefaultEnvironment = (): EnvironmentSchema => {
  return {
    id: DEFAULT_ENV_ID,
    name: "Default",
    data: {
      variables: {},
      headers: {},
    },
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

const getInitialState = () => {
  return {
    collections: {},
    apis: {},
    environments: {},
    activeEnvironmentId: DEFAULT_ENV_ID,
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

    // Load environments or create default if none exist
    const environments = await environmentStorage.list();
    let savedEnvironments: Record<string, StoredEnvironment["data"]>;

    if (environments.length === 0) {
      // Create default environment if none exist
      const defaultEnv = createDefaultEnvironment();
      await handleCreateEnvironment(defaultEnv);
      savedEnvironments = { [defaultEnv.id]: defaultEnv };
    } else {
      savedEnvironments = environments.reduce(
        (acc, env) => {
          acc[env.id] = env.data;
          return acc;
        },
        {} as Record<string, StoredEnvironment["data"]>
      );
    }

    set({
      apis: savedAPIs,
      collections: savedCollections,
      environments: savedEnvironments,
      activeEnvironmentId: DEFAULT_ENV_ID,
    });
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

      // Get environments for variable replacement
      const { environments } = get();
      const defaultEnv = environments["default"];
      const activeEnvironment = get().getActiveEnvironment();

      // Prepare base headers from API (excluding disabled ones)
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
        {} as Record<string, string>
      );

      // Prepare parameters from API (excluding disabled ones)
      const baseParameters = Object.values(api.parameters).reduce(
        (acc, value) => {
          if (value.isDisabled) {
            return acc;
          }
          return {
            ...acc,
            [value.name]: value.value,
          };
        },
        {} as Record<string, string>
      );

      // Remove query params from the url
      const urlWithoutQueryParams = api.url.split("?")[0];

      // Apply variable replacement to the request before processing
      const requestWithVariables = prepareRequestWithVariables(
        {
          url: urlWithoutQueryParams,
          headers: baseHeaders,
          params: baseParameters,
          body: api.requestBody,
          authorization: api.authorization,
        },
        defaultEnv?.data,
        activeEnvironment?.data
      );

      // Get environment headers with variable replacement
      const environmentHeaders: Record<string, string> = {};
      
      // Build merged environment data for variable replacement
      const mergedEnvData = {
        variables: { ...defaultEnv?.data.variables },
        headers: {},
      };
      
      // Overlay active environment variables
      if (activeEnvironment?.data.variables) {
        Object.assign(mergedEnvData.variables, activeEnvironment.data.variables);
      }
      
      // Track which environment headers are disabled in API headers
      const disabledEnvHeaders = new Set<string>();
      Object.values(api.headers).forEach((header) => {
        if (header.isDisabled && header.source === "environment") {
          disabledEnvHeaders.add(header.name);
        }
      });
      
      // First, add all default environment headers with variable replacement
      if (defaultEnv) {
        Object.values(defaultEnv.data.headers).forEach((header) => {
          // Skip if this header is disabled
          if (disabledEnvHeaders.has(header.name)) {
            return;
          }
          if (header.value) {
            environmentHeaders[header.name] = replaceVariables(header.value, mergedEnvData);
          }
        });
      }
      
      // Then, overlay active environment headers with variable replacement (if not default)
      if (activeEnvironment && !activeEnvironment.isDefault) {
        Object.values(activeEnvironment.data.headers).forEach((header) => {
          // Skip if this header is disabled
          if (disabledEnvHeaders.has(header.name)) {
            return;
          }
          if (header.value) {
            environmentHeaders[header.name] = replaceVariables(header.value, mergedEnvData);
          }
        });
      }

      // Apply authorization headers using the replaced authorization
      const authHeaders = prepareAuthorizationHeaders(
        requestWithVariables.authorization
      );

      // Merge headers: environment headers first, then replaced headers, then auth headers (highest priority)
      const preparedHeaders = {
        ...environmentHeaders,
        ...requestWithVariables.headers,
        ...authHeaders,
      };

      const payload = {
        method: api.method,
        url: requestWithVariables.url,
        headers: preparedHeaders,
        params: requestWithVariables.params,
        body: requestWithVariables.body,
      };
      console.log("payload", payload);
      // make the http request with replaced values
      const response = await getRequestClient().relayRequest(payload);

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
        const isLocalServer =
          api.url.includes("localhost") ||
          api.url.includes("127.0.0.1") ||
          api.url.includes("::1");
        const headerCount = Object.keys(preparedHeaders).length;
        const queryParamCount = Object.keys(requestWithVariables.params).length;
        const requestBodyType = api.requestBody.contentType || "none";
        const authorizationType = api.authorization.type || "none";

        track(Events.API_HIT, {
          method: api.method,
          response_status: response.response.statusCode,
          response_content_type: response.response.contentType || "unknown",
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
          response_content_type: "error",
          is_local_server: false,
          header_count: Object.keys(preparedHeaders).length,
          query_param_count: Object.keys(requestWithVariables.params).length,
          request_body_type: api.requestBody.contentType || "none",
          authorization_type: api.authorization.type || "none",
        });
      }
    } catch (error) {
      console.error(error);

      // Store the caught exception as an error response
      const errorMessage =
        error instanceof Error ? error.message : String(error);
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

  createEnvironment: (environment) => {
    const newEnvironment: EnvironmentSchema = {
      id: environment.id || generateUUID("env"),
      name: environment.name || "New Environment",
      data: {
        // Start with empty variables and headers
        // Default values will be shown as placeholders in the UI
        variables: {},
        headers: {},
      },
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...environment,
    };

    set((state) => ({
      environments: {
        ...state.environments,
        [newEnvironment.id]: newEnvironment,
      },
    }));
    handleCreateEnvironment(newEnvironment);

    return newEnvironment.id;
  },

  updateEnvironment: (id, environment) => {
    set((state) => ({
      environments: {
        ...state.environments,
        [id]: {
          ...state.environments[id],
          ...environment,
          updatedAt: new Date().toISOString(),
        },
      },
    }));
    handleUpdateEnvironment(get().environments[id]);
  },

  deleteEnvironment: (id) => {
    // Prevent deleting default environment
    if (id === DEFAULT_ENV_ID) {
      console.warn("Cannot delete default environment");
      return;
    }

    // If deleting active environment, switch to default
    if (get().activeEnvironmentId === id) {
      get().setActiveEnvironment(DEFAULT_ENV_ID);
    }

    set((state) => {
      const environments = { ...state.environments };
      delete environments[id];
      return { environments };
    });
    handleDeleteEnvironment(id);
  },

  setActiveEnvironment: (id) => {
    set({ activeEnvironmentId: id });
  },

  getActiveEnvironment: () => {
    const { environments, activeEnvironmentId } = get();
    return environments[activeEnvironmentId] || null;
  },
}));

export default useApiStore;
