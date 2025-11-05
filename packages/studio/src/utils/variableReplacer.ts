import { EnvironmentData } from "@/store/api-store/api.types";
import { Authorization, RequestBody } from "@apiclinic/core";

/**
 * Replaces variables in a string with values from environment data
 * Supports {{variableName}} syntax
 * 
 * @param text - The text containing variables to replace
 * @param environmentData - The environment data containing variables
 * @returns The text with variables replaced
 */
export const replaceVariables = (
  text: string,
  environmentData: EnvironmentData
): string => {
  if (!text || typeof text !== "string") {
    return text;
  }

  // Replace all {{variableName}} occurrences
  return text.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
    // Look up the variable by name (not by ID)
    // Variables are stored as Record<id, EnvironmentVariable>, so we need to find by name property
    const variable = Object.values(environmentData.variables).find(
      (v) => v.name === variableName
    );
    
    // Return the value if found, otherwise keep the original placeholder
    return variable?.value || match;
  });
};

/**
 * Replaces variables in an object's values recursively
 * 
 * @param obj - The object to process
 * @param environmentData - The environment data containing variables
 * @returns A new object with variables replaced
 */
export const replaceVariablesInObject = <T extends Record<string, unknown>>(
  obj: T,
  environmentData: EnvironmentData
): T => {
  const result: Record<string, unknown> = {};
  
  for (const key in obj) {
    const value = obj[key];
    
    if (typeof value === "string") {
      result[key] = replaceVariables(value, environmentData);
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      result[key] = replaceVariablesInObject(value as Record<string, unknown>, environmentData);
    } else {
      result[key] = value;
    }
  }
  
  return result as T;
};

/**
 * Replaces variables in request headers
 */
export const replaceVariablesInHeaders = (
  headers: Record<string, string>,
  environmentData: EnvironmentData
): Record<string, string> => {
  const result: Record<string, string> = {};
  
  for (const key in headers) {
    const replacedKey = replaceVariables(key, environmentData);
    const replacedValue = replaceVariables(headers[key], environmentData);
    result[replacedKey] = replacedValue;
  }
  
  return result;
};

/**
 * Replaces variables in request parameters
 */
export const replaceVariablesInParameters = (
  parameters: Record<string, string>,
  environmentData: EnvironmentData
): Record<string, string> => {
  const result: Record<string, string> = {};
  
  for (const key in parameters) {
    const replacedKey = replaceVariables(key, environmentData);
    const replacedValue = replaceVariables(parameters[key], environmentData);
    result[replacedKey] = replacedValue;
  }
  
  return result;
};

/**
 * Replaces variables in request body
 */
export const replaceVariablesInBody = (
  body: RequestBody,
  environmentData: EnvironmentData
): RequestBody => {
  if (!body.content) {
    return body;
  }

  let replacedContent = body.content;

  // Handle different content types
  if (body.contentType?.includes("json")) {
    try {
      // Try to parse as JSON and replace in the object
      const parsed = JSON.parse(body.content);
      const replaced = replaceVariablesInObject(parsed, environmentData);
      replacedContent = JSON.stringify(replaced);
    } catch {
      // If not valid JSON, treat as string
      replacedContent = replaceVariables(body.content, environmentData);
    }
  } else {
    // For text, xml, or other types, treat as string
    replacedContent = replaceVariables(body.content, environmentData);
  }

  return {
    ...body,
    content: replacedContent,
  };
};

/**
 * Replaces variables in authorization configuration
 */
export const replaceVariablesInAuthorization = (
  authorization: Authorization,
  environmentData: EnvironmentData
): Authorization => {
  if (!authorization || !authorization.type || authorization.type === "NONE") {
    return authorization;
  }

  switch (authorization.type) {
    case "BASIC":
      return {
        ...authorization,
        username: replaceVariables(authorization.username, environmentData),
        password: replaceVariables(authorization.password, environmentData),
      };

    case "BEARER":
      return {
        ...authorization,
        token: replaceVariables(authorization.token, environmentData),
      };

    case "API_KEY":
      return {
        ...authorization,
        key: replaceVariables(authorization.key, environmentData),
      };

    case "OAUTH2":
      return {
        ...authorization,
        token: replaceVariables(authorization.token, environmentData),
      };

    case "CUSTOM":
      return {
        ...authorization,
        token: replaceVariables(authorization.token, environmentData),
      };

    default:
      return authorization;
  }
};

/**
 * Main function to prepare request with variable replacement
 * Merges default and active environment data before replacement
 */
export const prepareRequestWithVariables = (
  request: {
    url: string;
    headers: Record<string, string>;
    params: Record<string, string>;
    body: RequestBody;
    authorization: Authorization;
  },
  defaultEnvironment?: EnvironmentData,
  activeEnvironment?: EnvironmentData
) => {
  // Merge environment data: default first, then active (for overrides)
  const mergedVariables: Record<string, { id: string; name: string; value: string }> = {};
  
  // Add default environment variables
  if (defaultEnvironment) {
    Object.entries(defaultEnvironment.variables).forEach(([key, variable]) => {
      if (variable.value) {
        mergedVariables[key] = variable;
      }
    });
  }
  
  // Overlay active environment variables (overrides defaults)
  if (activeEnvironment) {
    Object.entries(activeEnvironment.variables).forEach(([key, variable]) => {
      if (variable.value) {
        mergedVariables[key] = variable;
      }
    });
  }

  const environmentData: EnvironmentData = {
    variables: mergedVariables,
    headers: {}, // Headers are handled separately
  };

  // Replace variables in all parts of the request
  return {
    url: replaceVariables(request.url, environmentData),
    headers: replaceVariablesInHeaders(request.headers, environmentData),
    params: replaceVariablesInParameters(request.params, environmentData),
    body: replaceVariablesInBody(request.body, environmentData),
    authorization: replaceVariablesInAuthorization(request.authorization, environmentData),
  };
};

