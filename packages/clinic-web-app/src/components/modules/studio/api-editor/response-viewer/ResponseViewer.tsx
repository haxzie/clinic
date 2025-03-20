import React from "react";
import styles from "./ResponseViewer.module.scss";
import ResponseStatusBar from "./response-status-bar/ResponseStatusBar";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ResponseHeaders from "./response-headers/ResponseHeaders";
import JSONEditor from "@/components/modules/studio/json-editor/JSONEditor";
import { useAPI } from "../api-context-provider/APIContextProvider";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";
import EmptyResponse from "./empty-response/EmptyResponse";

export default function ResponseViewer() {
  const { apiId } = useAPI();
  const { response } = useApiStore(
    useShallow((state) => ({ response: state.apis[apiId].response }))
  );
  const value = `{
  "name": "John Doe",
  "age": 30,
  "cars": {
    "car1": "Ford",
    "car2": "BMW",
    "car3": "Fiat"
  }
}`;
  return (
    <Panel minSize={10} className={styles.responseViewer}>
      <PanelResizeHandle />
      {response ? (
        <PanelGroup direction="horizontal" className={styles.responseArea}>
          <Panel defaultSize={70} className={styles.viewerContent}>
            <ResponseStatusBar />
            <JSONEditor editable={false} value={value} />
          </Panel>

          <PanelResizeHandle />
          <ResponseHeaders />
        </PanelGroup>
      ) : (
        <EmptyResponse />
      )}
    </Panel>
  );
}
