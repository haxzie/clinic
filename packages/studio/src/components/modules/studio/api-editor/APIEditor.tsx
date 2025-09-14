import React from "react";
import styles from "./APIEditor.module.scss";
import RequestBuilder from "./request-builder/RequestBuilder";
import ResponseViewer from "./response-viewer/ResponseViewer";
import { PanelGroup } from "react-resizable-panels";
import { getResizablePanelStorage } from "@/utils/layout";

export default function APIEditor({ apiId }: { apiId: string }) {
  return (
    <div className={styles.APIEditor}>
      {/* <APIDetails /> */}
      <PanelGroup
        id={"api-editor"}
        autoSaveId={"api-editor-layout"}
        storage={getResizablePanelStorage()}
        direction="vertical"
      >
        <RequestBuilder apiId={apiId} />
        <ResponseViewer apiId={apiId} />
      </PanelGroup>
    </div>
  );
}
