import React, { useCallback, useMemo } from "react";
import styles from "./APIListView.module.scss";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";

export default function APIListView({
  collectionId = "root",
}: {
  collectionId: string;
}) {
  const { apis, setActiveAPI, activeAPI } = useApiStore(
    useShallow(({ apis, setActiveAPI, activeAPI, collections }) => ({
      collections,
      apis,
      setActiveAPI,
      activeAPI,
    }))
  );

  const filteredAPIs = useMemo(() => {
    return Object.values(apis).filter((api) => {
      return api.collectionId === collectionId;
    });
  }, [apis, collectionId]);

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
    <>
      {filteredAPIs.map((api) => (
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
    </>
  );
}
