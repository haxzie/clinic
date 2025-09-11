import React, {
  useState,
  useCallback,
  useEffect,
} from "react";
import styles from "./APIDetails.module.scss";
import { useShallow } from "zustand/shallow";
import useApiStore from "@/store/api-store/api.store";
import APIStatusIcon from "./api-status-icon/APIStatusIcon";
import ChevronRightIcon from "@/components/icons/ChevronRightIcon";
import EditableInputField from "../../explorer-panel/file-tree/editable-input-field/EditableInputField";

export default function APIDetails({ apiId }: { apiId: string }) {
  const { name, status, collectionName } = useApiStore(
    useShallow(({ apis, collections }) => ({
      name: apis[apiId].name,
      status: apis[apiId].response?.statusCode,
      collectionName: collections[apis[apiId].collectionId]?.name,
    }))
  );

  const [apiName, setApiName] = useState(name);

  const handleUpdateName = useCallback(
    (updatedName: string) => {
      // check if the name is empty
      if (updatedName.trim() === "") {
        setApiName(name);
      }
      // check if the name is different from the current name
      // and update the api name
      if (updatedName !== name) {
        useApiStore.getState().updateAPI(apiId, { name: updatedName });
      }
    },
    [apiId, name]
  );

  // handle name change
  useEffect(() => {
    setApiName(name);
  }, [name]);

  return (
    <div className={styles.header}>
      <div className={styles.apiStatusIcon}>
        <APIStatusIcon status={status} />
      </div>
      <div className={styles.collectionDetails}>
        {collectionName && (
          <div className={styles.collectionName}>
            <span>{collectionName}</span>
            <ChevronRightIcon size={20} />
          </div>
        )}
        <EditableInputField
          value={apiName}
          onChange={handleUpdateName}
          className={styles.input}
        />
      </div>
    </div>
  );
}
