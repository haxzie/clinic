export type RequestHeaders = Record<string, string>;
export type RequestMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "OPTIONS"
  | "HEAD";
export type RequestBody = {
  contentType: string;
  content: string;
};

export type RequestRelayProps = {
  url: string;
  method: RequestMethod;
  headers: RequestHeaders;
  body: RequestBody;
};
