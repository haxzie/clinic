import React, { createContext, useContext, useEffect, useMemo } from "react";
import type { RequestClient } from "../types/request";

const RequestClientContext = createContext<RequestClient | null>(null);
type AnalyticsListener = (event: string, properties?: Record<string, unknown>) => void;

let globalRequestClient: RequestClient | null = null;

export function setRequestClient(client: RequestClient) {
  globalRequestClient = client;
}

export function getRequestClient(): RequestClient {
  if (!globalRequestClient) {
    throw new Error("Request client not set. Provide it via StudioProvider or setRequestClient().");
  }
  return globalRequestClient;
}

export function useRequestClient(): RequestClient {
  const ctx = useContext(RequestClientContext);
  return ctx ?? (globalRequestClient as RequestClient);
}

const globalAnalyticsListeners = new Set<AnalyticsListener>();

export function onTrack(listener: AnalyticsListener) {
  globalAnalyticsListeners.add(listener);
  return () => {
    globalAnalyticsListeners.delete(listener);
  };
}

export function emitTrack(event: string, properties?: Record<string, unknown>) {
  if (globalAnalyticsListeners.size === 0) return;
  for (const listener of globalAnalyticsListeners) listener(event, properties);
}

export function StudioProvider({
  client,
  children,
  onTrack: onTrackProp,
}: {
  client: RequestClient;
  children: React.ReactNode;
  onTrack?: AnalyticsListener;
}) {
  setRequestClient(client);
  const value = useMemo(() => client, [client]);
  useEffect(() => {
    if (!onTrackProp) return;
    const off = onTrack(onTrackProp);
    return () => {
      off();
    };
  }, [onTrackProp]);
  return (
    <RequestClientContext.Provider value={value}>
      {children}
    </RequestClientContext.Provider>
  );
}


