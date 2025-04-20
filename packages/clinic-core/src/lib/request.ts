import http from "http";
import https from "https";
import { URL } from "url";
/**
 * Parameters
 */
export interface ParameterSchema {
  id: string;
  name: string;
  value: string;
}
export type RequestParameters = Record<string, ParameterSchema>;

/**
 * Headers
 */
export interface HeaderSchema {
  id: string;
  name: string;
  value: string;
}
export type RequestHeaders = Record<string, HeaderSchema>;
export type ResponseHeaders = Record<string, HeaderSchema>;

/**
 * Request Body
 */
export interface RequestBody {
  contentType: string | null; // application/json
  content?: string;
}

export enum AuthorizationTypes {
  NONE = "NONE",
  BASIC = "BASIC",
  BEARER = "BEARER",
  API_KEY = "API_KEY",
  OAUTH2 = "OAUTH2",
  CUSTOM = "CUSTOM",
}

export interface BasicAuthorization {
  type: AuthorizationTypes.BASIC;
  username: string;
  password: string;
}

export interface BearerAuthorization {
  type: AuthorizationTypes.BEARER;
  token: string;
}

export interface ApiKeyAuthorization {
  type: AuthorizationTypes.API_KEY;
  key: string;
}

export interface OAuth2Authorization {
  type: AuthorizationTypes.OAUTH2;
  token: string;
}

export interface CustomAuthorization {
  type: Authorization;
  token: string;
}

export interface Authorization {
  type: AuthorizationTypes;
  content: {
    [key in AuthorizationTypes]:
      | BasicAuthorization
      | BearerAuthorization
      | ApiKeyAuthorization
      | OAuth2Authorization
      | CustomAuthorization;
  };
}

export const RequestMethods = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
  OPTIONS: "OPTIONS",
  HEAD: "HEAD",
} as const;
export type RequestMethodType = keyof typeof RequestMethods;
export type RequestMethod = typeof RequestMethods[RequestMethodType];

export type ResponsePerformance = {
  duration: number;
  latency: number;
  processingTime: number;
  transferTime: number;
  transferSize: number;
  transferEncoding: string;
};

export interface Request {
  url: string;
  method: RequestMethod;
  headers: RequestHeaders;
  body: RequestBody;
  params: RequestParameters;
}

export interface Response {
  headers: ResponseHeaders;
  contentType: string | null;
  statusCode: number;
  content: string;
  performance: ResponsePerformance;
}

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

  // Parse URL to determine protocol and build request options
  const parsedUrl = new URL(request.url);

  // Add query params if provided
  if (request.params) {
    Object.values(request.params).forEach(({ name, value }) => {
      parsedUrl.searchParams.append(name, String(value));
    });
  }

  // Convert request headers format
  const requestHeaders: http.OutgoingHttpHeaders = {
    "X-Client-Timestamp": `${clientTimestamp}`,
  };

  // Add original headers
  Object.values(request.headers).forEach(({ name, value }) => {
    requestHeaders[name] = value;
  });

  // Determine which module to use based on protocol
  const httpModule = parsedUrl.protocol === "https:" ? https : http;

  // Build request options
  const options: http.RequestOptions = {
    method: request.method,
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || (parsedUrl.protocol === "https:" ? 443 : 80),
    path: parsedUrl.pathname + parsedUrl.search,
    headers: requestHeaders,
  };

  return new Promise<Response>((resolve, reject) => {
    const req = httpModule.request(options, (res) => {
      // First byte received
      responseStartTime = performance.now();

      let responseBody = "";

      // Collect response data
      res.on("data", (chunk) => {
        responseBody += chunk;
      });

      // Response completed
      res.on("end", () => {
        responseEndTime = performance.now();

        // Process the response
        try {
          const response = createResponseObject({
            statusCode: res.statusCode || 500,
            headers: res.headers,
            body: responseBody,
            clientStartTime,
            responseStartTime,
            responseEndTime,
            clientTimestamp,
          });

          resolve(response);
        } catch (error) {
          reject(
            new Error(
              `Failed to process response: ${
                error instanceof Error ? error.message : String(error)
              }`
            )
          );
        }
      });
    });

    // Handle request errors
    req.on("error", (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    // Send request body if provided
    if (request.body) {
      const body =
        typeof request.body === "string"
          ? request.body
          : JSON.stringify(request.body);

      req.write(body);
    }

    // Complete the request
    req.end();
  });
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
  headers: http.IncomingHttpHeaders;
  body: string;
  clientStartTime: number;
  responseStartTime: number;
  responseEndTime: number;
  clientTimestamp: number;
}): Response {
  // Process response headers
  const processedHeaders: RequestHeaders = {};
  Object.entries(headers).forEach(([key, value]) => {
    if (typeof value === "string") {
      processedHeaders[key] = { id: key, name: key, value };
    } else if (Array.isArray(value)) {
      processedHeaders[key] = { id: key, name: key, value: value.join(", ") };
    }
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
  const contentTypeHeader = headers["content-type"];
  const contentType =
    typeof contentTypeHeader === "string"
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
    // If JSON parsing fails, just use the raw body
    content = body;
  }

  // Calculate response size more accurately
  let actualTransferSize = 0;

  // For string responses
  if (typeof content === "string") {
    actualTransferSize = new TextEncoder().encode(content).length;
  }

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
      transferSize:
        actualTransferSize ||
        parseInt(
          typeof headers["content-length"] === "string"
            ? headers["content-length"]
            : "0",
          10
        ),
      transferEncoding:
        typeof headers["transfer-encoding"] === "string"
          ? headers["transfer-encoding"]
          : "identity",
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
  headers: http.IncomingHttpHeaders;
  clientStartTime: number;
  responseStartTime: number;
  clientTimestamp: number;
}): { networkLatency: number; processingTime: number } {
  // Check if we received server timing headers
  const serverTimestamp = headers["x-server-receive-time"];
  const serverProcessingStart = headers["x-server-processing-start"];

  // Calculate true network latency if server timestamp is available
  let networkLatency = 0;
  let processingTime = 0;

  if (serverTimestamp) {
    // Convert server timestamp to number
    const serverReceiveTime = parseInt(
      Array.isArray(serverTimestamp) ? serverTimestamp[0] : serverTimestamp,
      10
    );

    // True network latency: time from client send to server receive
    networkLatency = serverReceiveTime - clientTimestamp;

    if (serverProcessingStart) {
      // If we have both timestamps, we can calculate exact processing time
      const processingStartTime = parseInt(
        Array.isArray(serverProcessingStart)
          ? serverProcessingStart[0]
          : serverProcessingStart,
        10
      );
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
