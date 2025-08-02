import { describe, it, expect } from 'vitest';
import { parseCurlCommand } from '../src/utils/curlParser';

describe('Curl Parser', () => {
  describe('Basic GET requests', () => {
    it('should parse simple GET request (user provided sample)', () => {
      const curlCommand = "curl -X GET 'https://backend.composio.dev/api/v3/tools'";
      const result = parseCurlCommand(curlCommand);
      
      expect(result).not.toBeNull();
      expect(result!.method).toBe('GET');
      expect(result!.url).toBe('https://backend.composio.dev/api/v3/tools');
      expect(Object.keys(result!.headers)).toHaveLength(0);
      expect(Object.keys(result!.params)).toHaveLength(0);
      expect(result!.body).toBeUndefined();
    });

    it('should parse GET request without explicit method', () => {
      const curlCommand = "curl 'https://api.example.com/users'";
      const result = parseCurlCommand(curlCommand);
      
      expect(result).not.toBeNull();
      expect(result!.method).toBe('GET');
      expect(result!.url).toBe('https://api.example.com/users');
    });

    it('should parse GET request with query parameters', () => {
      const curlCommand = "curl 'https://api.example.com/users?page=1&limit=10'";
      const result = parseCurlCommand(curlCommand);
      
      expect(result).not.toBeNull();
      expect(result!.method).toBe('GET');
      expect(result!.url).toBe('https://api.example.com/users');
      expect(Object.keys(result!.params)).toHaveLength(2);
      
      const paramsValues = Object.values(result!.params);
      expect(paramsValues.find(p => p.name === 'page')?.value).toBe('1');
      expect(paramsValues.find(p => p.name === 'limit')?.value).toBe('10');
    });
  });

  describe('POST requests with data', () => {
    it('should parse POST request with JSON data', () => {
      const curlCommand = `curl -X POST 'https://api.example.com/users' -d '{"name":"John","email":"john@example.com"}'`;
      const result = parseCurlCommand(curlCommand);
      
      expect(result).not.toBeNull();
      expect(result!.method).toBe('POST');
      expect(result!.url).toBe('https://api.example.com/users');
      expect(result!.body).toBeDefined();
      expect(result!.body!.contentType).toBe('application/json');
      expect(result!.body!.content).toBe('{"name":"John","email":"john@example.com"}');
    });

    it('should parse POST request with form data', () => {
      const curlCommand = `curl -X POST 'https://api.example.com/login' -d 'username=admin&password=secret'`;
      const result = parseCurlCommand(curlCommand);
      
      expect(result).not.toBeNull();
      expect(result!.method).toBe('POST');
      expect(result!.body!.contentType).toBe('application/x-www-form-urlencoded');
      expect(result!.body!.content).toBe('username=admin&password=secret');
    });

    it('should parse POST request with --data-raw', () => {
      const curlCommand = `curl --data-raw 'raw text data' 'https://api.example.com/text'`;
      const result = parseCurlCommand(curlCommand);
      
      expect(result).not.toBeNull();
      expect(result!.method).toBe('POST');
      expect(result!.body!.contentType).toBe('text/plain');
      expect(result!.body!.content).toBe('raw text data');
    });

    it('should parse multipart form data', () => {
      const curlCommand = `curl -F 'file=@upload.txt' -F 'name=value' 'https://api.example.com/upload'`;
      const result = parseCurlCommand(curlCommand);
      
      expect(result).not.toBeNull();
      expect(result!.method).toBe('POST');
      expect(result!.body!.contentType).toBe('multipart/form-data');
    });
  });

  describe('Headers', () => {
    it('should parse single header', () => {
      const curlCommand = `curl -H 'Content-Type: application/json' 'https://api.example.com/data'`;
      const result = parseCurlCommand(curlCommand);
      
      expect(result).not.toBeNull();
      expect(Object.keys(result!.headers)).toHaveLength(1);
      
      const header = Object.values(result!.headers)[0];
      expect(header.name).toBe('Content-Type');
      expect(header.value).toBe('application/json');
    });

    it('should parse multiple headers', () => {
      const curlCommand = `curl -H 'Content-Type: application/json' -H 'Authorization: Bearer token123' 'https://api.example.com/secure'`;
      const result = parseCurlCommand(curlCommand);
      
      expect(result).not.toBeNull();
      expect(Object.keys(result!.headers)).toHaveLength(2);
      
      const headers = Object.values(result!.headers);
      expect(headers.find(h => h.name === 'Content-Type')?.value).toBe('application/json');
      expect(headers.find(h => h.name === 'Authorization')?.value).toBe('Bearer token123');
    });

    it('should override body content type with explicit Content-Type header', () => {
      const curlCommand = `curl -d '{"test": true}' -H 'Content-Type: application/xml' 'https://api.example.com/data'`;
      const result = parseCurlCommand(curlCommand);
      
      expect(result).not.toBeNull();
      expect(result!.body!.contentType).toBe('application/xml');
    });
  });

  describe('Authentication', () => {
    it('should parse basic authentication', () => {
      const curlCommand = `curl -u 'username:password' 'https://api.example.com/secure'`;
      const result = parseCurlCommand(curlCommand);
      
      expect(result).not.toBeNull();
      expect(Object.keys(result!.headers)).toHaveLength(1);
      
      const authHeader = Object.values(result!.headers)[0];
      expect(authHeader.name).toBe('Authorization');
      expect(authHeader.value).toMatch(/^Basic /);
      
      // Decode and verify
      const encoded = authHeader.value.replace('Basic ', '');
      const decoded = atob(encoded);
      expect(decoded).toBe('username:password');
    });

    it('should parse cookie header', () => {
      const curlCommand = `curl -b 'sessionId=abc123; userId=456' 'https://api.example.com/profile'`;
      const result = parseCurlCommand(curlCommand);
      
      expect(result).not.toBeNull();
      const cookieHeader = Object.values(result!.headers).find(h => h.name === 'Cookie');
      expect(cookieHeader?.value).toBe('sessionId=abc123; userId=456');
    });
  });

  describe('Other options', () => {
    it('should parse user agent', () => {
      const curlCommand = `curl -A 'MyApp/1.0' 'https://api.example.com/info'`;
      const result = parseCurlCommand(curlCommand);
      
      expect(result).not.toBeNull();
      const userAgentHeader = Object.values(result!.headers).find(h => h.name === 'User-Agent');
      expect(userAgentHeader?.value).toBe('MyApp/1.0');
    });

    it('should parse referer header', () => {
      const curlCommand = `curl -e 'https://referrer.com' 'https://api.example.com/data'`;
      const result = parseCurlCommand(curlCommand);
      
      expect(result).not.toBeNull();
      const refererHeader = Object.values(result!.headers).find(h => h.name === 'Referer');
      expect(refererHeader?.value).toBe('https://referrer.com');
    });
  });

  describe('Different HTTP methods', () => {
    it('should parse PUT request', () => {
      const curlCommand = `curl -X PUT -d '{"updated": true}' 'https://api.example.com/resource/1'`;
      const result = parseCurlCommand(curlCommand);
      
      expect(result).not.toBeNull();
      expect(result!.method).toBe('PUT');
    });

    it('should parse DELETE request', () => {
      const curlCommand = `curl -X DELETE 'https://api.example.com/resource/1'`;
      const result = parseCurlCommand(curlCommand);
      
      expect(result).not.toBeNull();
      expect(result!.method).toBe('DELETE');
    });

    it('should parse PATCH request', () => {
      const curlCommand = `curl -X PATCH -d '{"status": "active"}' 'https://api.example.com/users/1'`;
      const result = parseCurlCommand(curlCommand);
      
      expect(result).not.toBeNull();
      expect(result!.method).toBe('PATCH');
    });
  });

  describe('Complex real-world examples', () => {
    it('should parse complex API request with multiple headers and JSON body', () => {
      const curlCommand = `curl -X POST 'https://api.github.com/repos/owner/repo/issues' \
        -H 'Accept: application/vnd.github+json' \
        -H 'Authorization: Bearer ghp_token123' \
        -H 'X-GitHub-Api-Version: 2022-11-28' \
        -d '{"title":"Bug report","body":"Description of the bug","labels":["bug","priority:high"]}'`;
      
      const result = parseCurlCommand(curlCommand);
      
      expect(result).not.toBeNull();
      expect(result!.method).toBe('POST');
      expect(result!.url).toBe('https://api.github.com/repos/owner/repo/issues');
      expect(Object.keys(result!.headers)).toHaveLength(3);
      expect(result!.body!.contentType).toBe('application/json');
      
      const headers = Object.values(result!.headers);
      expect(headers.find(h => h.name === 'Accept')?.value).toBe('application/vnd.github+json');
      expect(headers.find(h => h.name === 'Authorization')?.value).toBe('Bearer ghp_token123');
    });

    it('should parse curl with query params and headers', () => {
      const curlCommand = `curl -H 'API-Key: secret123' 'https://api.service.com/search?q=nodejs&type=repositories&sort=stars'`;
      const result = parseCurlCommand(curlCommand);
      
      expect(result).not.toBeNull();
      expect(result!.url).toBe('https://api.service.com/search');
      expect(Object.keys(result!.params)).toHaveLength(3);
      
      const params = Object.values(result!.params);
      expect(params.find(p => p.name === 'q')?.value).toBe('nodejs');
      expect(params.find(p => p.name === 'type')?.value).toBe('repositories');
      expect(params.find(p => p.name === 'sort')?.value).toBe('stars');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should return null for invalid curl command', () => {
      const result = parseCurlCommand('not a curl command');
      expect(result).toBeNull();
    });

    it('should return null for curl command without URL', () => {
      const result = parseCurlCommand('curl -X GET');
      expect(result).toBeNull();
    });

    it('should handle curl command with extra whitespace', () => {
      const curlCommand = `  curl    -X   GET     'https://api.example.com/test'   `;
      const result = parseCurlCommand(curlCommand);
      
      expect(result).not.toBeNull();
      expect(result!.method).toBe('GET');
      expect(result!.url).toBe('https://api.example.com/test');
    });

    it('should handle malformed headers gracefully', () => {
      const curlCommand = `curl -H 'InvalidHeader' 'https://api.example.com/test'`;
      const result = parseCurlCommand(curlCommand);
      
      expect(result).not.toBeNull();
      expect(Object.keys(result!.headers)).toHaveLength(0);
    });

    it('should default to POST when data is provided without explicit method', () => {
      const curlCommand = `curl -d '{"data": "test"}' 'https://api.example.com/submit'`;
      const result = parseCurlCommand(curlCommand);
      
      expect(result).not.toBeNull();
      expect(result!.method).toBe('POST');
    });

    it('should handle localhost URLs', () => {
      const curlCommand = `curl 'localhost:3000/api/test'`;
      const result = parseCurlCommand(curlCommand);
      
      expect(result).not.toBeNull();
      expect(result!.url).toBe('localhost:3000/api/test');
    });

    it('should handle URLs without protocol', () => {
      const curlCommand = `curl 'api.example.com/test'`;
      const result = parseCurlCommand(curlCommand);
      
      expect(result).not.toBeNull();
      expect(result!.url).toBe('api.example.com/test');
    });
  });

  describe('Quoted strings and escaping', () => {
    it('should handle single quoted strings', () => {
      const curlCommand = `curl -d '{"message": "Hello World"}' 'https://api.example.com/message'`;
      const result = parseCurlCommand(curlCommand);
      
      expect(result).not.toBeNull();
      expect(result!.body!.content).toBe('{"message": "Hello World"}');
    });

    it('should handle double quoted strings', () => {
      const curlCommand = `curl -d "{\\"message\\": \\"Hello World\\"}" "https://api.example.com/message"`;
      const result = parseCurlCommand(curlCommand);
      
      expect(result).not.toBeNull();
      expect(result!.body!.content).toBe('{\\"message\\": \\"Hello World\\"}');
    });

    it('should handle mixed quotes in headers', () => {
      const curlCommand = `curl -H "Authorization: Bearer 'token123'" 'https://api.example.com/secure'`;
      const result = parseCurlCommand(curlCommand);
      
      expect(result).not.toBeNull();
      const authHeader = Object.values(result!.headers).find(h => h.name === 'Authorization');
      expect(authHeader?.value).toBe("Bearer 'token123'");
    });
  });
});
