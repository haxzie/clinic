"use client";

import { requestClient } from "@/services/clinic-server/relay";
import { Studio, StudioProvider } from "@apiclinic/studio";
import "@apiclinic/studio/style.css";
import posthog from "posthog-js";

export default function Home() {
  const onTrack = (event: string, properties?: Record<string, unknown>) => {
    try {
      posthog.capture(event, properties);
    } catch {
      // handle it here
    }
  };

  return (
    <StudioProvider client={requestClient} onTrack={onTrack}>
      <Studio />
    </StudioProvider>
  );
}
