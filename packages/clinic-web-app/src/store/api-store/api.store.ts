import { create } from "zustand";
// import { devtools } from "zustand/middleware";
import { APIStoreState } from "./api.types";
import { getDefaultRestApi } from "@/utils/constants";

const initialState = {
  apis: {},
  environment: "development",
};

const useApiStore = create<APIStoreState>()((set) => ({
  ...initialState,

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
