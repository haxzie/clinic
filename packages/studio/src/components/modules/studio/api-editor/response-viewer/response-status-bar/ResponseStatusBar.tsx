import React from "react";
import styles from "./ResponseStatusBar.module.scss";
import SlowIcon from "@/components/icons/SlowIcon";
import { formatTime } from "@/utils/dataUtils";
import IconButton from "@/components/base/icon-button/IconButton";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import ChevronUpIcon from "@/components/icons/ChevronUpIcon";

export default function ResponseStatusBar({
  status,
  time,
  isPanelHidden,
  onClickTogglePanel,
}: {
  status?: number;
  time?: number;
  isPanelHidden: boolean;
  onClickTogglePanel: () => void;
}) {

  const onDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only toggle if the click is directly on this element, not its children
    if (e.target === e.currentTarget) {
      onClickTogglePanel();
    }
  };
  
  return (
    <div className={styles.responseStatusBar} onDoubleClick={onDoubleClick}>
      <div className={styles.draggableHandle}></div>
      <div className={styles.details}>
        {status !== undefined && (
          <div className={styles.status}>
            <span className={styles.key}>Status: </span>
            <span className={styles.value}>
              <span
                className={styles.responseIcon}
                style={{
                  backgroundColor:
                    status >= 200 && status < 300
                      ? "var(--color-success)"
                      : "var(--color-error)",
                }}
              ></span>
              {status}
            </span>
          </div>
        )}
        {time !== undefined && (
          <div className={styles.status}>
            <span className={styles.key}>Time: </span>
            <span className={styles.value}>
              {formatTime(time)}
              {time > 1000 && (
                <span className={styles.slowIcon}>
                  <SlowIcon size={16} />
                </span>
              )}
            </span>
          </div>
        )}
      </div>
      <div className={styles.options}>
        <IconButton
          size="small"
          tooltip="Hide Panel"
          tooltipPosition="left"
          onClick={onClickTogglePanel}
        >
          {isPanelHidden ? (
            <ChevronUpIcon size={18} />
          ) : (
            <ChevronDownIcon size={18} />
          )}
        </IconButton>
      </div>
    </div>
  );
}
