import { describe, it, expect } from "vitest";
import {
  replaceVariables,
  replaceVariablesInHeaders,
  replaceVariablesInParameters,
  replaceVariablesInBody,
  replaceVariablesInAuthorization,
  prepareRequestWithVariables,
} from "./variableReplacer";
import { EnvironmentData } from "@/store/api-store/api.types";

describe("variableReplacer", () => {
  const mockEnvironmentData: EnvironmentData = {
    variables: {
      "var-1": {
        id: "var-1",
        name: "baseUrl",
        value: "https://api.example.com",
      },
      "var-2": {
        id: "var-2",
        name: "apiKey",
        value: "secret-key-123",
      },
      "var-3": {
        id: "var-3",
        name: "userId",
        value: "12345",
      },
      "var-4": {
        id: "var-4",
        name: "token",
        value: "bearer-token-xyz",
      },
    },
    headers: {},
  };

  describe("replaceVariables", () => {
    it("should replace single variable", () => {
      const result = replaceVariables("{{baseUrl}}/users", mockEnvironmentData);
      expect(result).toBe("https://api.example.com/users");
    });

    it("should replace multiple variables", () => {
      const result = replaceVariables(
        "{{baseUrl}}/users/{{userId}}",
        mockEnvironmentData
      );
      expect(result).toBe("https://api.example.com/users/12345");
    });

    it("should keep placeholder if variable not found", () => {
      const result = replaceVariables(
        "{{baseUrl}}/{{unknownVar}}",
        mockEnvironmentData
      );
      expect(result).toBe("https://api.example.com/{{unknownVar}}");
    });

    it("should handle empty string", () => {
      const result = replaceVariables("", mockEnvironmentData);
      expect(result).toBe("");
    });

    it("should handle string without variables", () => {
      const result = replaceVariables(
        "https://example.com",
        mockEnvironmentData
      );
      expect(result).toBe("https://example.com");
    });
  });

  describe("replaceVariablesInHeaders", () => {
    it("should replace variables in header values", () => {
      const headers = {
        Authorization: "Bearer {{token}}",
        "X-API-Key": "{{apiKey}}",
      };
      const result = replaceVariablesInHeaders(headers, mockEnvironmentData);
      expect(result).toEqual({
        Authorization: "Bearer bearer-token-xyz",
        "X-API-Key": "secret-key-123",
      });
    });

    it("should replace variables in header keys", () => {
      const headers = {
        "X-{{userId}}-Key": "value",
      };
      const result = replaceVariablesInHeaders(headers, mockEnvironmentData);
      expect(result).toEqual({
        "X-12345-Key": "value",
      });
    });
  });

  describe("replaceVariablesInParameters", () => {
    it("should replace variables in parameter values", () => {
      const params = {
        userId: "{{userId}}",
        apiKey: "{{apiKey}}",
      };
      const result = replaceVariablesInParameters(params, mockEnvironmentData);
      expect(result).toEqual({
        userId: "12345",
        apiKey: "secret-key-123",
      });
    });
  });

  describe("replaceVariablesInBody", () => {
    it("should replace variables in JSON body", () => {
      const body = {
        contentType: "application/json",
        content: JSON.stringify({
          userId: "{{userId}}",
          apiKey: "{{apiKey}}",
        }),
      };
      const result = replaceVariablesInBody(body, mockEnvironmentData);
      expect(JSON.parse(result.content)).toEqual({
        userId: "12345",
        apiKey: "secret-key-123",
      });
    });

    it("should replace variables in text body", () => {
      const body = {
        contentType: "text/plain",
        content: "User ID: {{userId}}",
      };
      const result = replaceVariablesInBody(body, mockEnvironmentData);
      expect(result.content).toBe("User ID: 12345");
    });

    it("should handle invalid JSON gracefully", () => {
      const body = {
        contentType: "application/json",
        content: "{{userId}} - not valid json",
      };
      const result = replaceVariablesInBody(body, mockEnvironmentData);
      expect(result.content).toBe("12345 - not valid json");
    });
  });

  describe("replaceVariablesInAuthorization", () => {
    it("should replace variables in BASIC auth", () => {
      const auth = {
        type: "BASIC" as const,
        username: "user-{{userId}}",
        password: "{{apiKey}}",
      };
      const result = replaceVariablesInAuthorization(auth, mockEnvironmentData);
      expect(result).toEqual({
        type: "BASIC",
        username: "user-12345",
        password: "secret-key-123",
      });
    });

    it("should replace variables in BEARER_TOKEN auth", () => {
      const auth = {
        type: "BEARER_TOKEN" as const,
        token: "{{token}}",
      };
      const result = replaceVariablesInAuthorization(auth, mockEnvironmentData);
      expect(result).toEqual({
        type: "BEARER_TOKEN",
        token: "bearer-token-xyz",
      });
    });

    it("should replace variables in API_KEY auth", () => {
      const auth = {
        type: "API_KEY" as const,
        key: "X-API-Key",
        value: "{{apiKey}}",
        in: "header" as const,
      };
      const result = replaceVariablesInAuthorization(auth, mockEnvironmentData);
      expect(result).toEqual({
        type: "API_KEY",
        key: "X-API-Key",
        value: "secret-key-123",
        in: "header",
      });
    });

    it("should handle NONE auth", () => {
      const auth = {
        type: "NONE" as const,
      };
      const result = replaceVariablesInAuthorization(auth, mockEnvironmentData);
      expect(result).toEqual({
        type: "NONE",
      });
    });
  });

  describe("prepareRequestWithVariables", () => {
    it("should replace variables in complete request", () => {
      const request = {
        url: "{{baseUrl}}/users/{{userId}}",
        headers: {
          Authorization: "Bearer {{token}}",
        },
        params: {
          key: "{{apiKey}}",
        },
        body: {
          contentType: "application/json",
          content: JSON.stringify({ userId: "{{userId}}" }),
        },
        authorization: {
          type: "BASIC" as const,
          username: "user",
          password: "{{apiKey}}",
        },
      };

      const result = prepareRequestWithVariables(
        request,
        mockEnvironmentData,
        undefined
      );

      expect(result.url).toBe("https://api.example.com/users/12345");
      expect(result.headers.Authorization).toBe("Bearer bearer-token-xyz");
      expect(result.params.key).toBe("secret-key-123");
      expect(JSON.parse(result.body.content)).toEqual({ userId: "12345" });
      expect(result.authorization.password).toBe("secret-key-123");
    });

    it("should merge default and active environment variables", () => {
      const defaultEnv: EnvironmentData = {
        variables: {
          "var-1": {
            id: "var-1",
            name: "baseUrl",
            value: "https://default.com",
          },
          "var-2": {
            id: "var-2",
            name: "apiKey",
            value: "default-key",
          },
        },
        headers: {},
      };

      const activeEnv: EnvironmentData = {
        variables: {
          "var-1": {
            id: "var-1",
            name: "baseUrl",
            value: "https://production.com",
          },
        },
        headers: {},
      };

      const request = {
        url: "{{baseUrl}}/api",
        headers: { key: "{{apiKey}}" },
        params: {},
        body: { contentType: "none", content: "" },
        authorization: { type: "NONE" as const },
      };

      const result = prepareRequestWithVariables(
        request,
        defaultEnv,
        activeEnv
      );

      // Active environment should override default
      expect(result.url).toBe("https://production.com/api");
      // Default value should be used when not overridden
      expect(result.headers.key).toBe("default-key");
    });
  });
});

