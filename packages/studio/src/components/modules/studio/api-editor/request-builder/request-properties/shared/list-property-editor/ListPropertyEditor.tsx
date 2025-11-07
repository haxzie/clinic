import { useMemo, useRef, useState } from "react";
import styles from "./ListPropertyEditor.module.scss";
import { generateUUID } from "@/utils/dataUtils";
import ClearIcon from "@/components/icons/ClearIcon";
import CopyIcon from "@/components/icons/CopyIcon";
import CheckBox from "@/components/base/check-box/CheckBox";
import VariableIcon from "@/components/icons/VariableIcon";
import KeyIcon from "@/components/icons/KeyIcon";
import RefreshIcon from "@/components/icons/RefreshIcon";
import IconButton from "@/components/base/icon-button/IconButton";
import VariableInput from "@/components/modules/studio/variable-input/VariableInput";

export type Parameter = {
  id: string;
  name: string;
  value: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isKeyReadOnly?: boolean;
  placeholder?: string;
  defaultValue?: string; // If present, empty values will reset to this on blur
  source?: "environment" | "auth" | "custom";
};

export default function ListPropertyEditor({
  type,
  title,
  value,
  onChange,
  allowSelection = false,
  hideHeader = false,
  disableNewItem = false,
  disableKeyChange = false,
  disableRemoveItem = false,
  onIconClick,
}: {
  type: string;
  title: string;
  onChange: (value: Record<string, Parameter>) => void;
  value: Record<string, Parameter>;
  allowSelection?: boolean;
  hideHeader?: boolean;
  disableNewItem?: boolean;
  disableKeyChange?: boolean;
  disableRemoveItem?: boolean;
  onIconClick?: (itemId: string) => void;
}) {
  const inputKeyRef = useRef<HTMLInputElement>(null);
  const [keyInput, setKeyInput] = useState("");
  const [valueInput, setValueInput] = useState("");
  /**
   * Adds a new key value pair into the store
   * @param key
   * @param value
   */
  const addKeyValue = (name: string, data: string, focus: "key" | "value" = "key") => {
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
      setKeyInput("");
      setValueInput("");
      // Focus on the newly created item's key field
      if (focus === "key") {
        document.getElementById(`${itemId}-key`)?.focus();
      } else {
        document.getElementById(`${itemId}-value`)?.focus();
      }
    }, 2);
  };

  const updateKeyValue = (id: string, name: string, data: string) => {
    const params = { ...value };
    params[id] = { ...params[id], id, name, value: data };
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

  const resetKeyValue = (id: string) => {
    const params = { ...value };
    params[id] = {
      ...params[id],
      value: "",
    };
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
      {!hideHeader && (
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
      )}
      <div className={styles.values}>
        {/* Render the static values first */}
        {Object.keys(value).map((itemId) => (
          <div
            className={[
              styles.param,
              value[itemId].isReadOnly && styles.readOnly,
              allowSelection &&
                value[itemId].isDisabled &&
                !value[itemId].isReadOnly &&
                styles.notSelected,
            ].join(" ")}
            key={`kv-${itemId}`}
          >
            {allowSelection && (
              <div className={styles.selection}>
                <CheckBox
                  value={
                    value[itemId].isReadOnly ? true : !value[itemId].isDisabled
                  }
                  disabled={value[itemId].isReadOnly}
                  onChange={() => toggleKeyValue(itemId)}
                />
              </div>
            )}

            <div className={styles.paramKey}>
              <input
                value={value[itemId].name || ""}
                id={`${itemId}-key`}
                onChange={(e) =>
                  updateKeyValue(itemId, e.target.value, value[itemId].value)
                }
                readOnly={value[itemId].isReadOnly || value[itemId].isKeyReadOnly || disableKeyChange}
                disabled={value[itemId].isReadOnly || value[itemId].isKeyReadOnly || disableKeyChange}
              />
              {value[itemId].source === "environment" && onIconClick && (
                <IconButton
                  size="small"
                  onClick={() => onIconClick(itemId)}
                  tooltip="Open environment editor"
                  className={styles.iconButton}
                >
                  <VariableIcon size={16} />
                </IconButton>
              )}
              {value[itemId].source === "auth" && onIconClick && (
                <IconButton
                  size="small"
                  onClick={() => onIconClick(itemId)}
                  tooltip="Open authorization settings"
                  className={styles.iconButton}
                >
                  <KeyIcon size={16} />
                </IconButton>
              )}
            </div>
            <div className={styles.paramValue}>
              {value[itemId].isReadOnly ? (
                // Use regular input for password/readonly fields
                <input
                  value={value[itemId].value || ""}
                  id={`${itemId}-value`}
                  type="password"
                  onChange={(e) =>
                    updateKeyValue(itemId, value[itemId].name, e.target.value)
                  }
                  readOnly={true}
                  placeholder={value[itemId].placeholder}
                />
              ) : (
                // Use VariableInput for editable text fields
                <VariableInput
                  value={value[itemId].value || ""}
                  onChange={(newValue) =>
                    updateKeyValue(itemId, value[itemId].name, newValue)
                  }
                  onBlur={(currentValue) => {
                    console.log("currentValue", currentValue);
                    console.log("value[itemId].defaultValue", value[itemId].defaultValue);
                    // Reset to defaultValue if empty and defaultValue exists
                    if (currentValue.trim() === "" && value[itemId].defaultValue) {
                      console.log("resetting to defaultValue", value[itemId].defaultValue);
                      updateKeyValue(itemId, value[itemId].name, value[itemId].defaultValue!);
                    }
                  }}
                  placeholder={value[itemId].placeholder}
                  className={styles.variableInputField}
                />
              )}
            </div>
            {/** Show action button for each item */}
            {value[itemId].isReadOnly ? (
              <div className={styles.actionButton}>
                <IconButton
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(value[itemId].value);
                  }}
                  tooltip="Copy value"
                  tooltipPosition="left"
                  showSuccess
                >
                  <CopyIcon size={18} />
                </IconButton>
              </div>
            ) : (
              !disableRemoveItem && (
                value[itemId].source === "environment" && value[itemId].value ? (
                  <div className={styles.actionButton}>
                    <IconButton
                      size="small"
                      onClick={() => resetKeyValue(itemId)}
                      tooltip="Reset to environment default"
                      tooltipPosition="left"
                      showSuccess
                    >
                      <RefreshIcon size={18} />
                    </IconButton>
                  </div>
                ) : (
                  <div className={styles.actionButton}>
                    <IconButton
                      size="small"
                      onClick={() => deleteKeyValue(itemId)}
                      tooltip="Delete"
                      tooltipPosition="left"
                      showSuccess
                    >
                      <ClearIcon size={18} />
                    </IconButton>
                  </div>
                )
              )
            )}
          </div>
        ))}
        {!disableNewItem && (
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
                onChange={(e) => {
                  const newKey = e.target.value;
                  setKeyInput(newKey);
                  // Only create a new item if we have a key and there's a value
                  if (newKey.trim()) {
                    addKeyValue(newKey, valueInput, "key");
                  }
                }}
              />
            </div>
            <div className={styles.paramValue}>
              <VariableInput
                value={valueInput}
                onChange={(newValue) => {
                  setValueInput(newValue);
                  // Only create a new item if we have a key
                  if (keyInput && newValue) {
                    addKeyValue(keyInput, newValue, "value");
                  }
                }}
                placeholder="value"
                className={styles.variableInputField}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
