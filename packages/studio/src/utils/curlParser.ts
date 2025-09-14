export interface ParsedCurlCommand {
  method: string;
  url: string;
  headers: Record<string, { id: string; name: string; value: string }>;
  body?: { contentType: string; content: string };
  params: Record<string, { id: string; name: string; value: string }>;
}

export function parseCurlCommand(curlCommand: string): ParsedCurlCommand | null {
  // Remove extra whitespace and normalize
  const normalized = curlCommand.trim().replace(/\s+/g, ' ');
  
  // Check if it starts with curl
  if (!normalized.toLowerCase().startsWith('curl ')) {
    return null;
  }

  // Initialize result
  const result: ParsedCurlCommand = {
    method: 'GET',
    url: '',
    headers: {},
    params: {},
  };

  // Split into tokens, handling quoted strings
  const tokens = parseTokens(normalized);
  
  let i = 1; // Skip 'curl'
  while (i < tokens.length) {
    const token = tokens[i];

    if (token === '-X' || token === '--request') {
      // Method
      i++;
      if (i < tokens.length) {
        result.method = tokens[i].toUpperCase();
      }
    } else if (token === '-H' || token === '--header') {
      // Header
      i++;
      if (i < tokens.length) {
        const header = parseHeader(tokens[i]);
        if (header) {
          const id = generateId();
          result.headers[id] = {
            id,
            name: header.name,
            value: header.value,
          };
        }
      }
         } else if (token === '-d' || token === '--data' || token === '--data-raw' || token === '--data-binary') {
       // Body data
       i++;
       if (i < tokens.length) {
         const data = tokens[i];
         
         // Determine content type based on the data format
         let contentType = 'application/json';
         if (data.startsWith('{') || data.startsWith('[')) {
           contentType = 'application/json';
         } else if (data.includes('=') && !data.startsWith('{')) {
           contentType = 'application/x-www-form-urlencoded';
         } else {
           contentType = 'text/plain';
         }
         
         result.body = {
           contentType,
           content: data,
         };
         // If method wasn't explicitly set and we have data, assume POST
         if (result.method === 'GET') {
           result.method = 'POST';
         }
       }
     } else if (token === '--form' || token === '-F') {
       // Form data
       i++;
       if (i < tokens.length) {
         result.body = {
           contentType: 'multipart/form-data',
           content: tokens[i],
         };
                  if (result.method === 'GET') {
           result.method = 'POST';
         }
       }
     } else if (token === '-u' || token === '--user') {
       // Basic authentication
       i++;
       if (i < tokens.length) {
         const auth = tokens[i];
         const encoded = btoa(auth);
         const id = generateId();
         result.headers[id] = {
           id,
           name: 'Authorization',
           value: `Basic ${encoded}`,
         };
       }
     } else if (token === '-A' || token === '--user-agent') {
       // User agent
       i++;
       if (i < tokens.length) {
         const id = generateId();
         result.headers[id] = {
           id,
           name: 'User-Agent',
           value: tokens[i],
         };
       }
     } else if (token === '-b' || token === '--cookie') {
       // Cookie
       i++;
       if (i < tokens.length) {
         const id = generateId();
         result.headers[id] = {
           id,
           name: 'Cookie',
           value: tokens[i],
         };
       }
     } else if (token === '-e' || token === '--referer') {
       // Referer
       i++;
       if (i < tokens.length) {
         const id = generateId();
         result.headers[id] = {
           id,
           name: 'Referer',
           value: tokens[i],
         };
       }
     } else if (token.startsWith('http://') || token.startsWith('https://')) {
      // URL
      result.url = token;
    } else if (!token.startsWith('-')) {
      // Assume it's the URL if no protocol prefix
      if (!result.url && (token.includes('.') || token.includes('localhost'))) {
        result.url = token;
      }
    }
    
    i++;
  }

  // Extract query parameters from URL
  if (result.url) {
    const [baseUrl, queryString] = result.url.split('?');
    if (queryString) {
      result.url = baseUrl;
      const params = new URLSearchParams(queryString);
      params.forEach((value, key) => {
        const id = generateId();
        result.params[id] = { id, name: key, value };
      });
    }
  }

  // Post-process: adjust content type based on Content-Type header if present
  if (result.body && result.headers) {
    for (const header of Object.values(result.headers)) {
      if (header.name.toLowerCase() === 'content-type') {
        result.body.contentType = header.value;
        break;
      }
    }
  }

  return result.url ? result : null;
}

function parseTokens(command: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  let i = 0;

  // Handle multi-line curl commands (remove line breaks and extra spaces)
  command = command.replace(/\\\s*\n\s*/g, ' ').replace(/\s+/g, ' ');

  while (i < command.length) {
    const char = command[i];
    
    if (!inQuotes && (char === '"' || char === "'")) {
      inQuotes = true;
      quoteChar = char;
    } else if (inQuotes && char === quoteChar && command[i - 1] !== '\\') {
      inQuotes = false;
      quoteChar = '';
    } else if (!inQuotes && char === ' ') {
      if (current.trim()) {
        tokens.push(current.trim());
        current = '';
      }
    } else if (char === '\\' && i + 1 < command.length && !inQuotes) {
      // Handle escaped characters outside quotes
      i++;
      const nextChar = command[i];
      if (nextChar === 'n') {
        current += '\n';
      } else if (nextChar === 't') {
        current += '\t';
      } else if (nextChar === 'r') {
        current += '\r';
      } else {
        current += nextChar;
      }
    } else {
      current += char;
    }
    
    i++;
  }

  if (current.trim()) {
    tokens.push(current.trim());
  }

  return tokens.filter(token => token.length > 0);
}

function parseHeader(headerString: string): { name: string; value: string } | null {
  const colonIndex = headerString.indexOf(':');
  if (colonIndex === -1) return null;
  
  const name = headerString.substring(0, colonIndex).trim();
  const value = headerString.substring(colonIndex + 1).trim();
  
  return { name, value };
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
} 