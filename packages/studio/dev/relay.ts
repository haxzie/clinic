import { Request, Response as APIResponse } from "@apiclinic/core";
import { RequestClient } from "../src/types/request";

export interface RelayResponse {
  status: string;
  response?: APIResponse;
  message?: string;
  timestamp: string;
}

// Development relay URL - can be overridden via environment variable
const RELAY_API_URL = import.meta.env.VITE_RELAY_API_URL || "http://localhost:8787";

export const relayRequest = async (
  request: Request
): Promise<RelayResponse> => {
  try {
    const response = await fetch(`${RELAY_API_URL}/relay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as RelayResponse;
  } catch (error) {
    console.error("Relay request failed:", error);
    throw error;
  }
};

export const requestClient: RequestClient = {
  relayRequest,
};

