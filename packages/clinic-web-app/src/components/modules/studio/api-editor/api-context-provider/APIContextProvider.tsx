import useApiStore from "@/store/api-store/api.store";
import { RequestHeaders, RequestMethod, RequestParameters, Authorization, RequestBody } from "@apiclinic/core";
import React, { createContext, useContext, ReactNode, useRef } from "react";

// Define the context type
interface APIEditorContextType {
  apiId: string;
}

// Create the context (no default value to enforce usage inside provider)
const APIEditorContext = createContext<APIEditorContextType | undefined>(
  undefined
);

// Provider Component (for each instance)
export const APIEditorContextProvider = ({
  children,
  activeApiId,
}: {
  children: ReactNode;
  activeApiId: string;
}) => {
  const apiId = useRef(activeApiId);

  return (
    <APIEditorContext.Provider value={{ apiId: apiId.current }}>
      {children}
    </APIEditorContext.Provider>
  );
};

// Custom hook for using the Counter context
export const useAPI = () => {
  const context = useContext(APIEditorContext);

  if (!context) {
    throw new Error("useAPI must be used within a CounterProvider");
  }

  const setMethod = (method: RequestMethod) => {
    useApiStore.getState().updateAPI(context?.apiId, { method });
  };

  const setPath = (path: string) => {
    useApiStore.getState().updateAPI(context?.apiId, { path });
  };

  const setDescription = (description: string) => {
    useApiStore.getState().updateAPI(context?.apiId, { description });
  };

  const setHeaders = (headers: RequestHeaders) => {
    useApiStore.getState().updateAPI(context?.apiId, { headers });
  };

  const setParameters = (parameters: RequestParameters) => {
    useApiStore.getState().updateAPI(context?.apiId, { parameters });
  };

  const setRequestBody = (requestBody: RequestBody) => {
    useApiStore.getState().updateAPI(context?.apiId, { requestBody });
  };

  const setAuthorization = (authorization: Authorization) => {
    useApiStore.getState().updateAPI(context?.apiId, { authorization });
  };

  const makeHTTPRequest = async () => {
    await useApiStore.getState().makeHTTPRequest(context?.apiId);
  }

  return {
    apiId: context.apiId,
    setMethod,
    setPath,
    setDescription,
    setHeaders,
    setParameters,
    setRequestBody,
    setAuthorization,
    makeHTTPRequest 
  };
};
