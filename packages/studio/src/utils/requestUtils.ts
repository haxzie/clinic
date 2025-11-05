import { APISchema } from "@/types/API.types";
import { prepareAuthorizationHeaders } from "./auth";
import { prepareRequestWithVariables, replaceVariables } from "./variableReplacer";
import useApiStore from "@/store/api-store/api.store";

export const createCurlCommand = (api: APISchema): string => {
  // Get environment data from store
  const store = useApiStore.getState();
  const activeEnvironment = store.getActiveEnvironment();
  const defaultEnvironment = store.environments["default"];

  // Prepare base headers from API (excluding disabled ones)
  const baseHeaders = Object.values(api.headers).reduce(
    (acc, value) => {
      if (value.isDisabled) {
        return acc;
      }
      return {
        ...acc,
        [value.name]: value.value,
      };
    },
    {} as Record<string, string>
  );

  // Prepare parameters from API (excluding disabled ones)
  const baseParameters = Object.values(api.parameters).reduce(
    (acc, value) => {
      if (value.isDisabled) {
        return acc;
      }
      return {
        ...acc,
        [value.name]: value.value,
      };
    },
    {} as Record<string, string>
  );

  // Remove query params from the url
  const urlWithoutQueryParams = api.url.split("?")[0];

  // Replace variables in all request parts
  const requestWithVariables = prepareRequestWithVariables(
    {
      url: urlWithoutQueryParams,
      headers: baseHeaders,
      params: baseParameters,
      body: api.requestBody,
      authorization: api.authorization,
    },
    defaultEnvironment?.data,
    activeEnvironment?.data
  );

  // Get environment headers with variable replacement
  const environmentHeaders: Record<string, string> = {};
  
  // Build merged environment data for variable replacement
  const mergedEnvData = {
    variables: { ...defaultEnvironment?.data.variables },
    headers: {},
  };
  
  // Overlay active environment variables
  if (activeEnvironment?.data.variables) {
    Object.assign(mergedEnvData.variables, activeEnvironment.data.variables);
  }
  
  // Track which environment headers are disabled in API headers
  const disabledEnvHeaders = new Set<string>();
  Object.values(api.headers).forEach((header) => {
    if (header.isDisabled && header.source === "environment") {
      disabledEnvHeaders.add(header.name);
    }
  });
  
  // First, add all default environment headers with variable replacement
  if (defaultEnvironment) {
    Object.values(defaultEnvironment.data.headers).forEach((header) => {
      // Skip if this header is disabled
      if (disabledEnvHeaders.has(header.name)) {
        return;
      }
      if (header.value) {
        environmentHeaders[header.name] = replaceVariables(header.value, mergedEnvData);
      }
    });
  }
  
  // Then, overlay active environment headers with variable replacement (if not default)
  if (activeEnvironment && !activeEnvironment.isDefault) {
    Object.values(activeEnvironment.data.headers).forEach((header) => {
      // Skip if this header is disabled
      if (disabledEnvHeaders.has(header.name)) {
        return;
      }
      if (header.value) {
        environmentHeaders[header.name] = replaceVariables(header.value, mergedEnvData);
      }
    });
  }

  // Apply authorization headers using the replaced authorization
  const authHeaders = prepareAuthorizationHeaders(
    requestWithVariables.authorization
  );

  // Merge headers: environment headers first, then replaced headers, then auth headers (highest priority)
  const preparedHeaders = {
    ...environmentHeaders,
    ...requestWithVariables.headers,
    ...authHeaders,
  };

  // Build URL with query parameters
  let requestURL = requestWithVariables.url;
  if (Object.keys(requestWithVariables.params).length > 0) {
    const queryString = Object.entries(requestWithVariables.params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    requestURL += `?${queryString}`;
  }

  const requestMethod = api.method.toUpperCase();

  let curlCommand = `curl -X ${requestMethod} '${requestURL}'`;

  // Add all merged headers
  Object.entries(preparedHeaders).forEach(([key, value]) => {
    curlCommand += ` -H '${key}: ${value}'`;
  });

  if (requestWithVariables.body.content) {
    // Escape single quotes in the body content
    const escapedBody = requestWithVariables.body.content.replace(/'/g, "'\\''");
    curlCommand += ` -d '${escapedBody}'`;
  }

  return curlCommand;
}


export const createFetchCommand = (api: APISchema): string => {
  // Get environment data from store
  const store = useApiStore.getState();
  const activeEnvironment = store.getActiveEnvironment();
  const defaultEnvironment = store.environments["default"];

  // Prepare base headers from API (excluding disabled ones)
  const baseHeaders = Object.values(api.headers).reduce(
    (acc, value) => {
      if (value.isDisabled) {
        return acc;
      }
      return {
        ...acc,
        [value.name]: value.value,
      };
    },
    {} as Record<string, string>
  );

  // Prepare parameters from API (excluding disabled ones)
  const baseParameters = Object.values(api.parameters).reduce(
    (acc, value) => {
      if (value.isDisabled) {
        return acc;
      }
      return {
        ...acc,
        [value.name]: value.value,
      };
    },
    {} as Record<string, string>
  );

  // Remove query params from the url
  const urlWithoutQueryParams = api.url.split("?")[0];

  // Replace variables in all request parts
  const requestWithVariables = prepareRequestWithVariables(
    {
      url: urlWithoutQueryParams,
      headers: baseHeaders,
      params: baseParameters,
      body: api.requestBody,
      authorization: api.authorization,
    },
    defaultEnvironment?.data,
    activeEnvironment?.data
  );

  // Get environment headers with variable replacement
  const environmentHeaders: Record<string, string> = {};
  
  // Build merged environment data for variable replacement
  const mergedEnvData = {
    variables: { ...defaultEnvironment?.data.variables },
    headers: {},
  };
  
  // Overlay active environment variables
  if (activeEnvironment?.data.variables) {
    Object.assign(mergedEnvData.variables, activeEnvironment.data.variables);
  }
  
  // Track which environment headers are disabled in API headers
  const disabledEnvHeaders = new Set<string>();
  Object.values(api.headers).forEach((header) => {
    if (header.isDisabled && header.source === "environment") {
      disabledEnvHeaders.add(header.name);
    }
  });
  
  // First, add all default environment headers with variable replacement
  if (defaultEnvironment) {
    Object.values(defaultEnvironment.data.headers).forEach((header) => {
      // Skip if this header is disabled
      if (disabledEnvHeaders.has(header.name)) {
        return;
      }
      if (header.value) {
        environmentHeaders[header.name] = replaceVariables(header.value, mergedEnvData);
      }
    });
  }
  
  // Then, overlay active environment headers with variable replacement (if not default)
  if (activeEnvironment && !activeEnvironment.isDefault) {
    Object.values(activeEnvironment.data.headers).forEach((header) => {
      // Skip if this header is disabled
      if (disabledEnvHeaders.has(header.name)) {
        return;
      }
      if (header.value) {
        environmentHeaders[header.name] = replaceVariables(header.value, mergedEnvData);
      }
    });
  }

  // Apply authorization headers using the replaced authorization
  const authHeaders = prepareAuthorizationHeaders(
    requestWithVariables.authorization
  );

  // Merge headers: environment headers first, then replaced headers, then auth headers (highest priority)
  const preparedHeaders = {
    ...environmentHeaders,
    ...requestWithVariables.headers,
    ...authHeaders,
  };

  // Build URL with query parameters
  let requestURL = requestWithVariables.url;
  if (Object.keys(requestWithVariables.params).length > 0) {
    const queryString = Object.entries(requestWithVariables.params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    requestURL += `?${queryString}`;
  }

  const requestMethod = api.method.toUpperCase();
  let fetchCommand = `fetch('${requestURL}', { method: '${requestMethod}'`;

  if (Object.keys(preparedHeaders).length > 0) {
    fetchCommand += `, headers: {`;
    Object.entries(preparedHeaders).forEach(([key, value]) => {
      // Escape single quotes in header values
      const escapedValue = value.replace(/'/g, "\\'");
      fetchCommand += ` '${key}': '${escapedValue}',`;
    });
    fetchCommand = fetchCommand.slice(0, -1); // Remove the last ','
    fetchCommand += ` }`;
  }

  if (requestWithVariables.body.content) {
    fetchCommand += `, body: JSON.stringify(${requestWithVariables.body.content})`;
  }

  fetchCommand += ` });`;

  return fetchCommand;
}


export const extractAPINameFromURL = (url: string): string => {
  // remove the protocol (http:// or https://)
  const urlWithoutProtocol = url.replace(/(^\w+:|^)\/\//, "");
  // split the url by /
  const urlParts = urlWithoutProtocol.split("/");
  // if there is only one part, return it
  if (urlParts.length === 1) {
    return `${urlParts[0]}`;
  }
  // // if there is more than two parts, then return the last 2 parts
  // if (urlParts.length > 2) {
  //   return `/${urlParts.slice(-2).join("/")}`;
  // }
  // if there are two parts, then return the last part
  return `/${urlParts[urlParts.length - 1]}`;
}