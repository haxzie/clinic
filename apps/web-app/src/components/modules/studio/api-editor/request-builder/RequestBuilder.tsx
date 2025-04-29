import React from "react";
import styles from "./RequestBuilder.module.scss";
import URLBuilder from "./url-builder/URLBuilder";
import RequestProperties from "./request-properties/RequestProperties";
import { Panel } from "react-resizable-panels";

export default function RequestBuilder() {
  return (
    <Panel minSize={15} className={styles.requestBuilder}>
      <URLBuilder/>
      <RequestProperties />
    </Panel>
  );
}
