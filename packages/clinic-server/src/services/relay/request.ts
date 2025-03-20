export const requestRelay = ({
  url,
  method,
  headers,
  body,
}: {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
}) => {
  return fetch(url, {
    method,
    headers,
    body,
  });
};
