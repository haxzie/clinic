import { APISchema } from "@/types/API.types";

export interface APIStoreState {
  activeAPI: string;
  apis: Record<string, APISchema>;
  environment: string;

  // actions
  makeHTTPRequest: (apiId: string) => Promise<void>;
  setAPIStatus: (apiId: string, status: boolean) => void;
  createAPI: (api: Partial<APISchema>) => string;
  updateAPI: (id: string, api: Omit<Partial<APISchema>, "id">) => void;
  deleteAPI: (id: string) => void;
}
