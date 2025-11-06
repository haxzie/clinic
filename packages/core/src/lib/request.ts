import { Request, Response, RequestHeaders } from "../types/API";

/**
 * Relays an HTTP request from controller input and captures detailed performance metrics
 * @param requestInput The request input from controller
 * @returns Response with performance metrics and streaming support
 */
export async function relayHTTPRequest(
  requestInput: Request
): Promise<Response> {
  // Timing metrics
  const clientStartTime = performance.now();
  let responseStartTime = 0;
  let responseEndTime = 0;

  // Add client timestamp for accurate latency calculation
  const clientTimestamp = Date.now();

  try {
    // Parse URL and add query params
    const parsedUrl = new URL(requestInput.url);

    if (requestInput.params) {
      Object.entries(requestInput.params).forEach(([key, value]) => {
        parsedUrl.searchParams.append(key, String(value));
      });
    }

    // Convert request headers format
    const requestHeaders: Record<string, string> = {
      "X-Client-Timestamp": `${clientTimestamp}`,
    };

    if (requestInput.headers) {
      Object.entries(requestInput.headers).forEach(([key, value]) => {
        if (typeof value === "string") {
          requestHeaders[key] = value;
        }
      });
    }

    // Prepare request body
    let fetchBody: string | undefined;
    const methodsWithoutBody = ["GET", "HEAD", "OPTIONS"];

    if (
      requestInput.body &&
      requestInput.body.content &&
      !methodsWithoutBody.includes(requestInput.method.toUpperCase())
    ) {
      fetchBody = requestInput.body.content;

      if (
        requestInput.body.contentType &&
        !Object.keys(requestHeaders).some(
          (key) => key.toLowerCase() === "content-type"
        )
      ) {
        requestHeaders["content-type"] = requestInput.body.contentType;
      }
    }

    // Make the fetch request
    const fetchResponse = await fetch(parsedUrl.toString(), {
      method: requestInput.method,
      headers: requestHeaders,
      body: fetchBody,
    });

    responseStartTime = performance.now();

    // Get content type early to determine how to handle the response
    const contentType =
      fetchResponse.headers.get("content-type")?.split(";")[0] || null;
    
    // Determine if this is binary content that should be converted to base64
    const isBinaryContent = contentType ? (
      contentType.startsWith("image/") ||
      contentType.startsWith("video/") ||
      contentType.startsWith("audio/") ||
      contentType === "application/pdf" ||
      contentType === "application/octet-stream" ||
      contentType.startsWith("application/vnd.") ||
      contentType.startsWith("font/")
    ) : false;

    // Handle streaming and non-streaming responses
    const shouldStream = isStreamingResponse(fetchResponse);
    let responseBody: string;

    if (isBinaryContent) {
      // For binary content, convert to base64
      const arrayBuffer = await fetchResponse.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // More efficient base64 conversion using chunks
      const chunkSize = 8192;
      let binary = '';
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      
      const base64 = btoa(binary);
      // Return as data URL for direct rendering
      responseBody = `data:${contentType};base64,${base64}`;
      
      console.log(`Binary content converted: ${contentType}, size: ${bytes.length} bytes`);
    } else if (shouldStream && fetchResponse.body) {
      // Stream the response internally and collect all data
      const reader = fetchResponse.body.getReader();
      const decoder = new TextDecoder();
      const chunks: string[] = [];

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          chunks.push(chunk);
        }

        responseBody = chunks.join("");
      } finally {
        reader.releaseLock();
      }
    } else {
      // Handle non-streaming response
      responseBody = await fetchResponse.text();
    }

    responseEndTime = performance.now();

    // Process response headers
    const processedHeaders: RequestHeaders = {};
    fetchResponse.headers.forEach((value, key) => {
      processedHeaders[key] = { id: key, name: key, value };
    });

    // Calculate timing metrics
    const duration = responseEndTime - clientStartTime;

    const response: Response = {
      headers: processedHeaders,
      contentType,
      statusCode: fetchResponse.status,
      content: responseBody,
      performance: {
        duration,
        latency: responseStartTime - clientStartTime,
        processingTime: 0,
        transferTime: responseEndTime - responseStartTime,
        transferSize: new TextEncoder().encode(responseBody).length,
        transferEncoding:
          fetchResponse.headers.get("transfer-encoding") || "identity",
      },
    };

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
 * Determines if a response should be handled as a streaming response
 */
function isStreamingResponse(response: globalThis.Response): boolean {
  const contentType = response.headers.get("content-type")?.toLowerCase() || "";
  const transferEncoding =
    response.headers.get("transfer-encoding")?.toLowerCase() || "";
  const contentLength = response.headers.get("content-length");

  // Explicit streaming formats
  if (
    contentType.includes("text/event-stream") ||
    contentType.includes("application/x-ndjson") ||
    contentType.includes("application/jsonl")
  ) {
    return true;
  }

  // Chunked encoding without content-length might be streaming
  // BUT only if it's NOT a regular JSON response
  if (transferEncoding.includes("chunked") && !contentLength) {
    // If it's regular JSON with chunked encoding, it's probably not streaming
    if (
      contentType === "application/json" ||
      contentType.startsWith("application/json;")
    ) {
      return false;
    }

    // Other content types with chunked encoding might be streaming
    if (
      contentType.includes("text/plain") ||
      contentType.includes("text/") ||
      contentType.includes("stream") ||
      contentType === ""
    ) {
      return true;
    }
  }

  // Large responses (>5MB) - stream to avoid memory issues
  if (contentLength !== null && parseInt(contentLength) > 5 * 1024 * 1024) {
    return true;
  }

  return false;
}
