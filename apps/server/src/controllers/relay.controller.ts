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
    
    // Always try streaming approach first to detect if response should be streamed
    return handleRequest(c, body);
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

async function handleRequest(c: Context, requestBody: {
  url: string;
  method: string;
  params?: Record<string, { name: string; value: string }>;
  headers?: Record<string, string | { name: string; value: string }>;
  body?: { content?: string; contentType?: string };
}) {
  // Parse URL and add query params
  const parsedUrl = new URL(requestBody.url);
  
  if (requestBody.params) {
    Object.values(requestBody.params).forEach(({ name, value }) => {
      parsedUrl.searchParams.append(name, String(value));
    });
  }

  // Convert request headers format
  const requestHeaders: Record<string, string> = {
    "X-Client-Timestamp": `${Date.now()}`,
  };
  
  Object.entries(requestBody.headers || {}).forEach(([key, value]) => {
    if (typeof value === 'string') {
      requestHeaders[key] = value;
    } else if (value && typeof value === 'object' && 'name' in value && 'value' in value) {
      requestHeaders[value.name] = value.value;
    }
  });

  // Prepare request body
  let fetchBody: string | undefined;
  const methodsWithoutBody = ['GET', 'HEAD', 'OPTIONS'];
  
  if (requestBody.body && requestBody.body.content && !methodsWithoutBody.includes(requestBody.method.toUpperCase())) {
    fetchBody = requestBody.body.content;
    
    if (requestBody.body.contentType && !Object.keys(requestHeaders).some(key => key.toLowerCase() === "content-type")) {
      requestHeaders["content-type"] = requestBody.body.contentType;
    }
  }

  const clientStartTime = performance.now();

  // Make the fetch request
  const fetchResponse = await fetch(parsedUrl.toString(), {
    method: requestBody.method,
    headers: requestHeaders,
    body: fetchBody,
  });

  const responseStartTime = performance.now();

  // Always handle as complete response - stream internally if needed
  const shouldStream = isStreamingResponse(fetchResponse);
  let responseBody: string;
  
  if (shouldStream && fetchResponse.body) {
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
      
      responseBody = chunks.join('');
    } finally {
      reader.releaseLock();
    }
  } else {
    // Handle non-streaming response (buffer and return with metrics)
    responseBody = await fetchResponse.text();
  }
  
  const responseEndTime = performance.now();

  // Process response headers
  const processedHeaders: Record<string, { id: string; name: string; value: string }> = {};
  fetchResponse.headers.forEach((value, key) => {
    processedHeaders[key] = { id: key, name: key, value };
  });

  // Calculate timing metrics
  const duration = responseEndTime - clientStartTime;
  const contentType = fetchResponse.headers.get("content-type")?.split(";")[0] || null;

  const response = {
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
      transferEncoding: fetchResponse.headers.get("transfer-encoding") || "identity",
    },
  };

  return c.json({
    status: "success",
    response: response,
    timestamp: new Date().toISOString()
  });
}

function isStreamingResponse(response: Response): boolean {
  const contentType = response.headers.get('content-type')?.toLowerCase() || '';
  const transferEncoding = response.headers.get('transfer-encoding')?.toLowerCase() || '';
  const contentLength = response.headers.get('content-length');
  
  // Explicit streaming formats
  if (
    contentType.includes('text/event-stream') ||
    contentType.includes('application/x-ndjson') ||
    contentType.includes('application/jsonl')
  ) {
    return true;
  }
  
  // Chunked encoding without content-length might be streaming
  // BUT only if it's NOT a regular JSON response
  if (transferEncoding.includes('chunked') && !contentLength) {
    // If it's regular JSON with chunked encoding, it's probably not streaming
    if (contentType === 'application/json' || contentType.startsWith('application/json;')) {
      return false;
    }
    
    // Other content types with chunked encoding might be streaming
    if (
      contentType.includes('text/plain') ||
      contentType.includes('text/') ||
      contentType.includes('stream') ||
      contentType === ''
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