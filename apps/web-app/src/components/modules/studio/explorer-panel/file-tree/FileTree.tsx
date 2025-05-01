import React from "react";
import styles from "./FileTree.module.scss";
import ChevronRightIcon from "@/components/icons/ChevronRightIcon";

export default function FileTree() {
  const folders = ["auth", "ingestion", "client"];
  const files = [
    {
      name: "/health",
      method: "GET",
    },
    {
      name: "/login",
      method: "POST",
    },
    {
      name: "/logout",
      method: "DELETE",
    },
    {
      name: "/auth/register",
      method: "PATCH",
    },
    {
      name: "/chat/bloop",
      method: "PUT",
    },
  ];

  return (
    <div className={styles.fileTree}>
      <div className={styles.fileListing}>
        {folders.map((folder) => (
          <div key={folder} className={styles.folder}>
            <div className={styles.icon}>
              <ChevronRightIcon size={18} />
            </div>
            <div className={styles.folderName}>{folder}</div>
            {/* <ChevronRightIcon size={16} /> */}
          </div>
        ))}
        {files.map((file) => (
          <div key={file.name} className={styles.file}>
            {/* <div className={[styles.method, styles[file.method]].join(" ")}>
            </div> */}
            <div className={styles.texts}>
              <div className={[styles.methodText].join(" ")}>{file.method}</div>
              <div className={styles.name}>{file.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
