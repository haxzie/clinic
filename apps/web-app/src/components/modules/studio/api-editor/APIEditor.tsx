import React from "react";
import styles from "./APIEditor.module.scss";
import RequestBuilder from "./request-builder/RequestBuilder";
import ResponseViewer from "./response-viewer/ResponseViewer";
import { PanelGroup } from "react-resizable-panels";
import { getResizablePanelStorage } from "@/utils/layout";
import { APIEditorContextProvider } from "./api-context-provider/APIContextProvider";

export default function APIEditor({ apiId }: { apiId: string }) {
  return (
    <APIEditorContextProvider activeApiId={apiId}>
      <div className={styles.APIEditor}>
        {/* <APIDetails /> */}
        <PanelGroup
          id={"api-editor"}
          autoSaveId={"api-editor-layout"}
          storage={getResizablePanelStorage()}
          direction="vertical"
        >
          <RequestBuilder />
          <ResponseViewer/>
        </PanelGroup>
      </div>
    </APIEditorContextProvider>
  );
}
