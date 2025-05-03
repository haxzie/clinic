import React, { useState, ChangeEvent, useCallback, useRef, useEffect } from "react";
import styles from "./APIDetails.module.scss";
import { useShallow } from "zustand/shallow";
import useApiStore from "@/store/api-store/api.store";
import APIStatusIcon from "./api-status-icon/APIStatusIcon";

export default function APIDetails({ apiId }: { apiId: string }) {
  const { name, status } = useApiStore(
    useShallow(({ apis }) => ({
      name: apis[apiId].name,
      status: apis[apiId].response?.statusCode,
    }))
  );

  const [apiName, setApiName] = useState(name);
  const [editable, setEditable] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Function to handle the change of the API name input
   */
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setApiName(e.target.value);
  };

  /**
   * Function to handle the click on the API name
   * to make it editable
   */
  const handleClickEditName = () => {
    setEditable(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 0);
  };

  const handleUpdateName = useCallback(() => {
    // check if the name is empty
    if (apiName.trim() === "") {
      setApiName(name);
      return;
    }
    // check if the name is different from the current name
    // and update the api name
    if (apiName !== name) {
      useApiStore.getState().updateAPI(apiId, { name: apiName });
    }

    setEditable(false);
    // inputRef.current?.blur();
  }, [apiName, apiId, name]);

  /**
   * Function to handle the submit of the form
   * or enter key press.
   * Simply blurs the input to trigger the onBlur event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inputRef.current?.blur();
  };

  // handle name change
  useEffect(() => {
      setApiName(name => {
        if (name !== apiName) {
          return name;
        }
        return apiName;
      }
    );
  }, [name, apiName]);

  return (
    <div className={styles.header}>
      <div className={styles.apiStatusIcon}>
        <APIStatusIcon status={status} />
      </div>
      <form
        className={`${styles.editableTitle} ${editable ? styles.editable : ""}`}
        onSubmit={handleSubmit}
      >
        <h2 className={styles.title} onClick={handleClickEditName}>
          {apiName}
        </h2>
        <input
          ref={inputRef}
          type="text"
          value={apiName}
          onChange={handleNameChange}
          onBlur={handleUpdateName}
        />
      </form>
    </div>
  );
}
