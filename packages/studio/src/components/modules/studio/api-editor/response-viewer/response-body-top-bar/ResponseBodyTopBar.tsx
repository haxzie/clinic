import React from "react";
import styles from "./ResponseBodyTopBar.module.scss";
import { formatByteSize } from "@/utils/dataUtils";
import IconButton from "@/components/base/icon-button/IconButton";
import CopyIcon from "@/components/icons/CopyIcon";
import DownloadIcon from "@/components/icons/DownloadIcon";

export default function ResponseBodyTopBar({
  responseType,
  size,
  onClickCopy,
  onClickDownload,
}: {
  responseType: string;
  size: number;
  onClickCopy: () => void;
  onClickDownload: () => void;
}) {
  return (
    <div className={styles.responseBodyTopBar}>
      <div className={styles.texts}>
        <p>
          ContentType: <span>{responseType}</span>
        </p>
        <p>
          Size: <span>{formatByteSize(size)}</span>
        </p>
      </div>
      <div className={styles.options}>
        <IconButton
          size="small"
          tooltip="Copy Response"
          onClick={onClickCopy}
          showSuccess
        >
          <CopyIcon size={16} />
        </IconButton>
        <IconButton
          size="small"
          tooltip="Download Response"
          onClick={onClickDownload}
          showSuccess
        >
          <DownloadIcon size={16} />
        </IconButton>
      </div>
    </div>
  );
}
