import { Authorization } from "@apiclinic/core";

/**
 * Prepares authorization headers based on the authorization configuration
 * @param authorization - The authorization configuration
 * @returns {Record<string, string>} - The authorization headers to be added
 */
export const prepareAuthorizationHeaders = (
  authorization?: Authorization
): Record<string, string> => {
  if (!authorization || authorization.type === "NONE") {
    return {};
  }

  switch (authorization.type) {
    case "BASIC":
      if (authorization.username && authorization.password) {
        const credentials = btoa(
          `${authorization.username}:${authorization.password}`
        );
        return {
          Authorization: `Basic ${credentials}`,
        };
      }
      break;
    case "BEARER":
      if (authorization.token) {
        return {
          Authorization: `Bearer ${authorization.token}`,
        };
      }
      break;
    case "API_KEY":
      if (authorization.key) {
        return {
          Authorization: authorization.key,
        };
      }
      break;
    case "OAUTH2":
      if (authorization.token) {
        return {
          Authorization: `Bearer ${authorization.token}`,
        };
      }
      break;
    case "CUSTOM":
      if (authorization.token) {
        return {
          Authorization: authorization.token,
        };
      }
      break;
  }
  return {};
};
