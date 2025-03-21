import React, { useEffect } from "react";
import styles from "./ResponseStatusBar.module.scss";
import SlowIcon from "@/components/icons/SlowIcon";
import { formatTime } from "@/utils/dataUtils";
import IconButton from "@/components/base/icon-button/IconButton";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import ChevronUpIcon from "@/components/icons/ChevronUpIcon";
import { AnimatePresence, motion } from "motion/react";

export default function ResponseStatusBar({
  status,
  time,
  isPanelHidden,
  onClickTogglePanel,
}: {
  status: number;
  time: number;
  isPanelHidden: boolean;
  onClickTogglePanel: () => void;
}) {
  return (
    <div className={styles.responseStatusBar}>
      <div className={styles.details}>
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
