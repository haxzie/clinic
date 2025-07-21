import { RELAY_API_URL } from "@/utils/secrets";
import { Request, Response as APIResponse } from "@apiclinic/core";

export interface RelayResponse {
  status: string;
  response?: APIResponse;
  message?: string;
  timestamp: string;
}

export const relayRequest = async (request: Request): Promise<RelayResponse> => {
  const response = await fetch(`${RELAY_API_URL}/relay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // Server always returns complete JSON response now
  const data = await response.json();
  return data as RelayResponse;
};


