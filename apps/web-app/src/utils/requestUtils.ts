import { APISchema } from "@/types/API.types";
import { prepareAuthorizationHeaders } from "./auth";

export const createCurlCommand = (api: APISchema): string => {
  let requestURL = api.url;
  const requestMethod = api.method.toUpperCase();

  let curlCommand = `curl -X ${requestMethod} '${requestURL}' -H 'Content-Type: application/json'`;
  const authHeaders = prepareAuthorizationHeaders(api.authorization);

  Object.entries(authHeaders).forEach(([key, value]) => {
    curlCommand += ` -H '${key}: ${value}'`;
  });

  if (api.headers && Object.keys(api.headers).length > 0) {
    Object.values(api.headers).forEach((value) => {
      curlCommand += ` -H '${value.name}: ${value.value}'`;
    });
  }

  if (api.requestBody.content) {
    curlCommand += ` -d '${api.requestBody.content}'`;
  }

  return curlCommand;
}


export const createFetchCommand = (api: APISchema): string => {
  let requestURL = api.url;
  if (api.parameters && Object.keys(api.parameters).length > 0) {
    requestURL += "?";
    Object.entries(api.parameters).forEach(([key, value]) => {
      requestURL += `${key}=${value}&`;
    });
    requestURL = requestURL.slice(0, -1); // Remove the last '&'
  }
  const requestMethod = api.method.toUpperCase();
  let fetchCommand = `fetch('${requestURL}', { method: '${requestMethod}'`;
  if (api.headers && Object.keys(api.headers).length > 0) {
    fetchCommand += `, headers: {`;
    Object.entries(api.headers).forEach(([key, value]) => {
      fetchCommand += ` '${key}': '${value}',`;
    });
    fetchCommand = fetchCommand.slice(0, -1); // Remove the last ','
    fetchCommand += ` }`;
  }
  if (api.requestBody.content) {
    fetchCommand += `, body: JSON.stringify(${api.requestBody.content})`;
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