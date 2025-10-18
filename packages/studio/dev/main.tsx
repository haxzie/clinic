import React from "react";
import { createRoot } from "react-dom/client";
import { Studio } from "../src/components/modules/studio/Studio";
import { StudioProvider } from "../src/provider/StudioProvider";
import { requestClient } from "./relay";
import "../src/styles/global.scss";
import "./styles.scss";

const App = () => {
  const onTrack = (event: string, properties?: Record<string, unknown>) => {
    console.log("[Analytics]", event, properties);
  };

  return (
    <StudioProvider client={requestClient} onTrack={onTrack}>
      <Studio />
    </StudioProvider>
  );
};

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

console.log("Mounting Studio...");
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

