import React from "react";
import styles from "./ResponseStatusBar.module.scss";
import SlowIcon from "@/components/icons/SlowIcon";
import IconButton from "@/components/base/icon-button/IconButton";
import CopyIcon from "@/components/icons/CopyIcon";
import DownloadIcon from "@/components/icons/DownloadIcon";

export default function ResponseStatusBar() {
  return (
    <div className={styles.responseStatusBar}>
      <div className={styles.details}>
        <div className={styles.status}>
          <span className={styles.key}>Status: </span>
          <span className={styles.value}>
            <span className={styles.responseIcon}></span>200 OK
          </span>
        </div>
        <div className={styles.status}>
          <span className={styles.key}>Time: </span>
          <span className={styles.value}>
            1.2s{" "}
            <span className={styles.slowIcon}>
              <SlowIcon size={16} />
            </span>
          </span>
        </div>
      </div>
      <div className={styles.options}>
        <IconButton size="small" tooltip="Copy Response" showSuccess>
          <CopyIcon size={16} />
        </IconButton>
        <IconButton size="small" tooltip="Download Response" showSuccess>
          <DownloadIcon size={16} />
        </IconButton>
      </div>
    </div>
  );
}
