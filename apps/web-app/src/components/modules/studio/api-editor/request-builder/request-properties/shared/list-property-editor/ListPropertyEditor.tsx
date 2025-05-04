import React, { useMemo, useRef, useState } from "react";
import styles from "./ListPropertyEditor.module.scss";
import { generateUUID } from "@/utils/dataUtils";
import ClearIcon from "@/components/icons/ClearIcon";
import CopyIcon from "@/components/icons/CopyIcon";
import CheckBox from "@/components/base/check-box/CheckBox";

type Parameter = {
  id: string;
  name: string;
  value: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
};
export default function ListPropertyEditor({
  type,
  title,
  value,
  onChange,
  allowSelection = false,
}: {
  type: string;
  title: string;
  onChange: (value: Record<string, Parameter>) => void;
  value: Record<string, Parameter>;
  allowSelection?: boolean;
}) {
  const inputKeyRef = useRef<HTMLInputElement>(null);
  const inputValueRef = useRef<HTMLInputElement>(null);
  const [keyInput, setKeyInput] = useState("");
  const [valueInput, setValueInput] = useState("");
  /**
   * Adds a new key value pair into the store
   * @param key
   * @param value
   */
  const addKeyValue = (name: string, data: string) => {
    const itemId = generateUUID(type);
    const params = {
      ...value,
      [itemId]: {
        id: itemId,
        name,
        value: data,
      },
    };
    onChange(params);

    setTimeout(() => {
      if (name) {
        setKeyInput("");
        document.getElementById(`${itemId}-key`)?.focus();
      } else {
        setValueInput("");
        document.getElementById(`${itemId}-value`)?.focus();
      }
    }, 2);
  };

  const updateKeyValue = (id: string, name: string, data: string) => {
    const params = { ...value };
    params[id] = { id, name, value: data };
    onChange(params);
  };

  const toggleKeyValue = (id: string) => {
    const params = { ...value };
    params[id] = {
      ...params[id],
      isDisabled: !params[id].isDisabled,
    };
    onChange(params);
  };

  const deleteKeyValue = (id: string) => {
    const params = { ...value };
    delete params[id];
    onChange(params);
  };

  const toggleAllSection = (shouldEnable: boolean) => {
    const params = { ...value };
    Object.keys(params).forEach((itemId) => {
      params[itemId] = {
        ...params[itemId],
        isDisabled: !shouldEnable,
      };
    });
    onChange(params);
  };

  const isAllEnabled = useMemo(
    () => Object.keys(value).every((itemId) => !value[itemId].isDisabled),
    [value]
  );

  return (
    <div
      className={[
        styles.parameterEditor,
        allowSelection && styles.allowSelection,
      ].join(" ")}
    >
      <div className={styles.header}>
        {allowSelection && (
          <div className={styles.selection}>
            <CheckBox
              value={isAllEnabled}
              onChange={() => {
                toggleAllSection(!isAllEnabled);
              }}
            />
          </div>
        )}
        <div className={styles.paramKey}>{title}</div>
        <div className={styles.paramValue}>Value</div>
      </div>
      <div className={styles.values}>
        {Object.keys(value).map((itemId) => (
          <div
            className={[
              styles.param,
              value[itemId].isReadOnly && styles.readOnly,
              allowSelection && value[itemId].isDisabled && styles.notSelected,
            ].join(" ")}
            key={`kv-${itemId}`}
          >
            {allowSelection && (
              <div className={styles.selection}>
                <CheckBox
                  value={!value[itemId].isDisabled}
                  onChange={() => toggleKeyValue(itemId)}
                />
              </div>
            )}

            <input
              className={styles.paramKey}
              value={value[itemId].name || ""}
              id={`${itemId}-key`}
              onChange={(e) =>
                updateKeyValue(itemId, e.target.value, value[itemId].value)
              }
              readOnly={value[itemId].isReadOnly}
            />
            <input
              className={styles.paramValue}
              value={value[itemId].value || ""}
              id={`${itemId}-value`}
              type={value[itemId].isReadOnly ? "password" : "text"}
              onChange={(e) =>
                updateKeyValue(itemId, value[itemId].name, e.target.value)
              }
              readOnly={value[itemId].isReadOnly}
            />
            {/** Show delete button only for editable items items */}
            {value[itemId].isReadOnly ? (
              <button
                className={styles.deleteButton}
                onClick={() => {
                  navigator.clipboard.writeText(value[itemId].value);
                }}
              >
                <CopyIcon size={18} />
              </button>
            ) : (
              <button
                className={styles.deleteButton}
                onClick={() => deleteKeyValue(itemId)}
              >
                <ClearIcon size={18} />
              </button>
            )}
          </div>
        ))}
        <div className={[styles.param, styles.placeholder].join(" ")}>
          {allowSelection && (
            <div className={styles.selection}>
              <CheckBox value={true} disabled={true} />
            </div>
          )}
          <div className={styles.paramKey}>
            <input
              ref={inputKeyRef}
              value={keyInput}
              type="text"
              placeholder="key"
              onChange={(e) => addKeyValue(e.target.value, "")}
            />
          </div>
          <div className={styles.paramValue}>
            <input
              ref={inputValueRef}
              value={valueInput}
              type="text"
              placeholder="value"
              onChange={(e) => addKeyValue("", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
