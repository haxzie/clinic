import React from "react";
import styles from "./ResponseHeaders.module.scss";
import { Panel } from "react-resizable-panels";
import IconButton from "@/components/base/icon-button/IconButton";
import HidePanelIcon from "@/components/icons/HidePanelIcon";

export default function ResponseHeaders() {
  const resonseHeaders: Record<string, string> = {
    status: "200 OK",
    "content-type": "application/json",
    "content-length": "1234",
    date: "Wed, 21 Oct 2015 07:28:00 GMT",
    connection: "keep-alive",
    "x-powered-by": "Express",
    etag: 'W/"1234567890"',
    vary: "Accept-Encoding",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
    "access-control-allow-headers":
      "Content-Type, Authorization, Content-Length, X-Requested-With",
    "access-control-expose-headers":
      "Content-Type, Authorization, Content-Length, X-Requested-With",
    "access-control-max-age": "600",
    "x-content-type-options": "nosniff",
    "x-xss-protection": "1; mode=block",
    "content-security-policy": "default-src 'self'",
    "x-frame-options": "SAMEORIGIN",
  };
  return (
    <Panel defaultSize={40} className={styles.responseHeaders}>
      <div className={styles.header}>
        <h4>Response</h4>
        <div className={styles.options}>
          <IconButton size="small">
            <HidePanelIcon size={18} />
          </IconButton>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.timingDisplay}>
          <h4 className={styles.title}>Response time</h4>
          <div className={styles.timingGraph}>
            <div className={styles.timingBar}>
              <div className={styles.latency} style={{ width: `30%` }}></div>
              <div
                className={styles.processingTime}
                style={{ width: `20%` }}
              ></div>
              <div
                className={styles.transferTime}
                style={{ width: `50%` }}
              ></div>
            </div>
          </div>
          <div className={styles.timingItem}>
            <span className={styles.timingKey}>Duration</span>
            <span className={styles.timingValue}>100ms</span>
          </div>
          <div className={styles.timingItem}>
            <span className={styles.timingKey}>Latency</span>
            <span className={styles.timingValue}>50ms</span>
          </div>
          <div className={styles.timingItem}>
            <span className={styles.timingKey}>Transfer Time</span>
            <span className={styles.timingValue}>10ms</span>
          </div>
          <div className={styles.timingItem}>
            <span className={styles.timingKey}>Transfer Size</span>
            <span className={styles.timingValue}>1KB</span>
          </div>
        </div>
        <div className={styles.headersDisplay}>
          <h4 className={styles.title}>Response Headers</h4>
          {Object.keys(resonseHeaders).map((key) => (
            <div className={styles.headerItem} key={key}>
              <span className={styles.headerKey}>{key}</span>
              <span className={styles.headerValue}>{resonseHeaders[key]}</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
