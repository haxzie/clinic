import { create } from "zustand";
// import { devtools } from "zustand/middleware";
import { APIStoreState } from "./api.types";
import { getDefaultRestApi } from "@/utils/constants";
import { relayRequest } from "@/services/clinic-server/relay";

const initialState = {
  apis: {},
  environment: "development",
};

const useApiStore = create<APIStoreState>()((set, get) => ({
  ...initialState,

  makeHTTPRequest: async (apiId) => {
    const api = get().apis[apiId];
    if (!api) {
      throw new Error(`API with id ${apiId} not found`);
    }
    // make http request
    try {
      // set the api status to loading
      get().setAPIStatus(apiId, true);
      // make the http request
      const { status, data } = await relayRequest({
        method: api.method,
        url: api.path,
        headers: api.headers,
        body: api.requestBody,
        params: api.parameters,
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
        ...state.apis,
        [newApi.id]: newApi,
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
    set((state) => {
      const apis = { ...state.apis };
      delete apis[id];
      return { apis };
    });
  },
}));

export default useApiStore;
