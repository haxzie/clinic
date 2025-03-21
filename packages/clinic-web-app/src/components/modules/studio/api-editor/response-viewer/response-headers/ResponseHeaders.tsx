import React, { useCallback } from "react";
import styles from "./ResponseHeaders.module.scss";
import { Panel } from "react-resizable-panels";
import IconButton from "@/components/base/icon-button/IconButton";
import HidePanelIcon from "@/components/icons/HidePanelIcon";
import { ResponseHeaders, ResponsePerformance } from "@apiclinic/core";
import { formatTime } from "@/utils/dataUtils";
import Tooltip from "@/components/base/tooltip/Tooltip";

export default function ResponseHeadersView({
  performance,
  headers,
}: {
  performance: ResponsePerformance;
  headers: ResponseHeaders;
}) {
  // calculate the width of the timing bars
  const getTimingBars = useCallback((): Array<{
    type: string;
    width: string;
    color: string;
  }> => {
    const total =
      performance.latency +
      performance.processingTime +
      performance.transferTime;
    return [
      {
        type: "latency",
        width: `${(performance.latency / total) * 100}%`,
        color: "#F5A623",
      },
      {
        type: "processing",
        width: `${(performance.processingTime / total) * 100}%`,
        color: "#4A90E2",
      },
      {
        type: "transfer",
        width: `${(performance.transferTime / total) * 100}%`,
        color: "#7ED321",
      },
    ];
  }, [performance]);

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
              {getTimingBars().map((bar) => (
                <Tooltip 
                  key={bar.type} 
                  text={bar.type} 
                  delay={0}
                  style={{
                  width: `${bar.width}`,
                  height: "6px"
                }}>
                  <div
                    key={bar.type}
                    className={styles[bar.type]}
                    style={{ width: "100%", height: "100%", backgroundColor: bar.color }}
                  ></div>
                </Tooltip>
              ))}
            </div>
          </div>
          <div className={styles.timingItem}>
            <span className={styles.timingKey}>Latency</span>
            <span className={styles.timingValue}>
              {formatTime(performance.latency)}
            </span>
          </div>
          <div className={styles.timingItem}>
            <span className={styles.timingKey}>Processing Time</span>
            <span className={styles.timingValue}>
              {formatTime(performance.processingTime)}
            </span>
          </div>
          <div className={styles.timingItem}>
            <span className={styles.timingKey}>Transfer Time</span>
            <span className={styles.timingValue}>
              {formatTime(performance.transferTime)}
            </span>
          </div>
        </div>
        <div className={styles.headersDisplay}>
          <h4 className={styles.title}>Response Headers</h4>
          {Object.keys(headers).map((key) => (
            <div className={styles.headerItem} key={headers[key].id}>
              <span className={styles.headerKey}>{headers[key].name}</span>
              <span className={styles.headerValue}>{headers[key].value}</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
