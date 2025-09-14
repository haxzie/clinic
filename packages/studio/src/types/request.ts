import type { Request, Response as APIResponse } from "@apiclinic/core";

export interface RelayResponse {
  status: string;
  response?: APIResponse;
  message?: string;
  timestamp: string;
}

export interface RequestClient {
  relayRequest(request: Request): Promise<RelayResponse>;
}


