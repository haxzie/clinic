import { APISchema } from "@/types/API.types";

export interface APIStoreState {
  apis: Record<string, APISchema>;
  environment: string;

  // actions
  createAPI: (api: Partial<APISchema>) => string;
  updateAPI: (id: string, api: Omit<Partial<APISchema>, "id">) => void;
  deleteAPI: (id: string) => void;
}
