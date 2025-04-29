import { relayClient } from "./client";
import { Request, Response } from "@apiclinic/core";

export interface RelayResponse {
  status: string;
  response?: Response;
  message?: string;
  timestamp: string;
}
export const relayRequest = (request: Request) => {
  return relayClient.post<RelayResponse>("", request);
};
