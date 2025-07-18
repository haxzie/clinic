import { relayHTTPRequest, Response as RelayResponse } from "@apiclinic/core";
import { Context } from "hono";

export const relayController = async (c: Context) => {
  try {
    // Get request body from client
    const body = await c.req.json().catch(() => ({}));
    
    // Ensure required fields are present
    if (!body.url || !body.method) {
      return c.json({
        status: "error",
        message: "Missing required fields: url and method are required"
      }, 400);
    }
    
    
    // Make the request using our relay function
    const response: RelayResponse = await relayHTTPRequest({
      url: body.url,
      method: body.method,
      params: body.params ?? {},
      headers: body.headers ?? {},
      body: body.body ?? {}
    });
    
    // Return the relayed response with performance metrics
    return c.json({
      status: "success",
      response: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Handle errors
    console.error("Relay request failed:", error);
    
    return c.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString()
    }, 500);
  }
};