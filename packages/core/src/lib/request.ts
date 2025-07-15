import { Request, Response, RequestHeaders } from "../types/API";

/**
 * Relays an HTTP request and captures detailed performance metrics
 * @param request The request object to relay
 * @returns Response with performance metrics
 */
export async function relayHTTPRequest(request: Request): Promise<Response> {
  // Timing metrics
  const clientStartTime = performance.now();
  let responseStartTime = 0;
  let responseEndTime = 0;

  // Add client timestamp for accurate latency calculation
  const clientTimestamp = Date.now();

  try {
    // Parse URL and add query params
    const parsedUrl = new URL(request.url);
    
    if (request.params) {
      Object.values(request.params).forEach(({ name, value }) => {
        parsedUrl.searchParams.append(name, String(value));
      });
    }

    // Convert request headers format
    const requestHeaders: Record<string, string> = {
      "X-Client-Timestamp": `${clientTimestamp}`,
    };

    // Add original headers
    Object.values(request.headers).forEach(({ name, value }) => {
      requestHeaders[name] = value;
    });

    // Prepare request body (ignore for GET, HEAD, OPTIONS methods)
    let requestBody: string | undefined;
    const methodsWithoutBody = ['GET', 'HEAD', 'OPTIONS'];
    
    if (request.body && request.body.content && !methodsWithoutBody.includes(request.method.toUpperCase())) {
      requestBody = request.body.content;
      
      // Set content-type if provided and not already set
      if (request.body.contentType && !requestHeaders["content-type"]) {
        requestHeaders["content-type"] = request.body.contentType;
      }
    }

    

    // Build fetch options
    const fetchOptions: RequestInit = {
      method: request.method,
      headers: requestHeaders,
      body: requestBody,
    };

    // Make the request
    const fetchResponse = await fetch(parsedUrl.toString(), fetchOptions);
    
    // First byte received
    responseStartTime = performance.now();

    // Read response body
    const responseBody = await fetchResponse.text();
    
    // Response completed
    responseEndTime = performance.now();

    // Process the response
    const response = createResponseObject({
      statusCode: fetchResponse.status,
      headers: fetchResponse.headers,
      body: responseBody,
      clientStartTime,
      responseStartTime,
      responseEndTime,
      clientTimestamp,
    });

    return response;

  } catch (error) {
    throw new Error(
      `Request failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Helper function to create a standardized response object
 */
function createResponseObject({
  statusCode,
  headers,
  body,
  clientStartTime,
  responseStartTime,
  responseEndTime,
  clientTimestamp,
}: {
  statusCode: number;
  headers: Headers;
  body: string;
  clientStartTime: number;
  responseStartTime: number;
  responseEndTime: number;
  clientTimestamp: number;
}): Response {
  // Process response headers
  const processedHeaders: RequestHeaders = {};
  headers.forEach((value, key) => {
    processedHeaders[key] = { id: key, name: key, value };
  });

  // Calculate timing metrics
  const { networkLatency, processingTime } = calculateTimingMetrics({
    headers,
    clientStartTime,
    responseStartTime,
    clientTimestamp,
  });

  const duration = responseEndTime - clientStartTime;
  const transferTime = responseEndTime - responseStartTime;

  // Extract content type
  const contentTypeHeader = headers.get("content-type");
  const contentType = contentTypeHeader 
    ? contentTypeHeader.split(";")[0] 
    : null;

  // Parse JSON if content type is application/json
  let content = body;
  try {
    if (contentType === "application/json" && typeof body === "string") {
      // Validate it's actually JSON by parsing and re-stringifying
      const parsed = JSON.parse(body);
      content = JSON.stringify(parsed);
    }
  } catch (error) {
    console.error(
      `Failed to parse JSON response: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    // If JSON parsing fails, just use the raw body
    content = body;
  }

  // Calculate response size more accurately
  let actualTransferSize = 0;

  // For string responses
  if (typeof content === "string") {
    actualTransferSize = new TextEncoder().encode(content).length;
  }

  // Get content-length from headers
  const contentLengthHeader = headers.get("content-length");
  const contentLength = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;

  // Build and return response object
  return {
    headers: processedHeaders,
    contentType,
    statusCode,
    content,
    performance: {
      duration,
      latency: networkLatency,
      processingTime,
      transferTime,
      transferSize: actualTransferSize || contentLength,
      transferEncoding: headers.get("transfer-encoding") || "identity",
    },
  };
}

/**
 * Calculate network latency and server processing time
 */
function calculateTimingMetrics({
  headers,
  clientStartTime,
  responseStartTime,
  clientTimestamp,
}: {
  headers: Headers;
  clientStartTime: number;
  responseStartTime: number;
  clientTimestamp: number;
}): { networkLatency: number; processingTime: number } {
  // Check if we received server timing headers
  const serverTimestamp = headers.get("x-server-receive-time");
  const serverProcessingStart = headers.get("x-server-processing-start");

  // Calculate true network latency if server timestamp is available
  let networkLatency = 0;
  let processingTime = 0;

  if (serverTimestamp) {
    // Convert server timestamp to number
    const serverReceiveTime = parseInt(serverTimestamp, 10);

    // True network latency: time from client send to server receive
    networkLatency = serverReceiveTime - clientTimestamp;

    if (serverProcessingStart) {
      // If we have both timestamps, we can calculate exact processing time
      const processingStartTime = parseInt(serverProcessingStart, 10);
      processingTime = processingStartTime - serverReceiveTime;
    } else {
      // Estimate processing time based on first byte received
      processingTime = responseStartTime - clientStartTime - networkLatency;
    }
  } else {
    // Fallback to estimates if server didn't return timing headers
    const timeToFirstByte =
      responseStartTime > 0 ? responseStartTime - clientStartTime : 0;
    networkLatency = Math.round(timeToFirstByte * 0.3); // Estimated network latency
    processingTime = timeToFirstByte - networkLatency;
  }

  return { networkLatency, processingTime };
}