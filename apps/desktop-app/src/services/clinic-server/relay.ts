import { invoke } from '@tauri-apps/api/core';
import { Request, Response as APIResponse } from "@apiclinic/core";

export interface RelayResponse {
  status: string;
  response?: APIResponse;
  message?: string;
  timestamp: string;
}

export const relayRequest = async (request: Request): Promise<RelayResponse> => {
  try {
    const response = await invoke<RelayResponse>('relay_request', { request });
    return response;
  } catch (error) {
    // Handle Tauri invoke errors
    throw new Error(`Tauri command error: ${error}`);
  }
};


