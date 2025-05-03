import React, { useCallback } from "react";
import styles from "./FileTree.module.scss";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";

export default function FileTree() {
  const { apis, setActiveAPI, activeAPI } = useApiStore(
    useShallow(({ apis, setActiveAPI, activeAPI }) => ({
      apis,
      setActiveAPI,
      activeAPI,
    }))
  );

  const getClassForStatus = useCallback((statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return styles.success;
    } else if (statusCode >= 300 && statusCode < 400) {
      return styles.redirect;
    } else if (statusCode >= 400 && statusCode < 500) {
      return styles.clientError;
    } else if (statusCode >= 500) {
      return styles.serverError;
    }
    return styles.default;
  }, []);

  return (
    <div className={styles.fileTree}>
      <div className={styles.fileListing}>
        {/* {folders.map((folder) => (
          <div key={folder} className={styles.folder}>
            <div className={styles.icon}>
              <ChevronRightIcon size={18} />
            </div>
            <div className={styles.folderName}>{folder}</div>
          </div>
        ))} */}
        {Object.values(apis).map((api) => (
          <div
            key={api.id}
            className={`${styles.file} ${
              api.id === activeAPI ? styles.active : ""
            }`}
            onClick={() => setActiveAPI(api.id)}
          >
            <div className={styles.texts}>
              <div className={[styles.methodText].join(" ")}>{api.method}</div>
              <div className={styles.name}>{api.name}</div>
              <span
                className={`${styles.status} ${getClassForStatus(api.response?.statusCode || 0)}`}
              >
                {api.response?.statusCode}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
