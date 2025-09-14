import { emitTrack } from "../provider/StudioProvider";

export const Events = {
  /**
   * API Events
   */
  API_CREATED: "API_CREATED",
  API_DELETED: "API_DELETED",
  API_VIEWED: "API_VIEWED",
  API_HIT: "API_HIT",
  /**
   * API Request Events
   */
  API_CURL_COPIED: "API_CURL_COPIED",
  API_FETCH_COPIED: "API_FETCH_COPIED",
  API_RESPONSE_DOWNLOADED: "API_RESPONSE_DOWNLOADED",
  API_RESPONSE_COPIED: "API_RESPONSE_COPIED",
  API_REQUEST_BODY_UPLOADED: "API_REQUEST_BODY_UPLOADED",
  API_REQUEST_BODY_PRETTIFIED: "API_REQUEST_BODY_PRETTIFIED",
  /**
   * Collection Events
   */
  COLLECTION_CREATED: "COLLECTION_CREATED",
  COLLECTION_DELETED: "COLLECTION_DELETED",
  COLLECTION_VIEWED: "COLLECTION_VIEWED",
} as const;

export const track = (event: string, properties: Record<string, unknown>) => {
  try {
    emitTrack(event, properties);
  } catch (error) {
    console.error("Error tracking event", event, properties, error);
  }
};
