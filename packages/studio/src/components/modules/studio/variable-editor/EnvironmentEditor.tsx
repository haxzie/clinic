import React, { useState, useCallback, useRef } from "react";
import styles from "./EnvironmentEditor.module.scss";
import IconButton from "@/components/base/icon-button/IconButton";
import ClearIcon from "@/components/icons/ClearIcon";
import ListPropertyEditor, { Parameter } from "../api-editor/request-builder/request-properties/shared/list-property-editor/ListPropertyEditor";
import { createDialog, TProps } from "@/hooks/useDialog";
import AddIcon from "@/components/icons/AddIcon";
import DeleteIcon from "@/components/icons/DeleteIcon";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";
import EditableInputField from "../explorer-panel/file-tree/editable-input-field/EditableInputField";
import { EnvironmentVariable } from "@/store/api-store/api.types";
import { motion, AnimatePresence } from "motion/react";
import LockIcon from "@/components/icons/LockIcon";

type TabType = "variables" | "headers";

export default function EnvironmentEditor({ close, data }: TProps<unknown, { tab?: TabType }>) {
  const hasAnimatedRef = useRef(false);
  const { environments, activeEnvironmentId, createEnvironment, updateEnvironment, deleteEnvironment, setActiveEnvironment } = useApiStore(
    useShallow(({ environments, activeEnvironmentId, createEnvironment, updateEnvironment, deleteEnvironment, setActiveEnvironment }) => ({
      environments,
      activeEnvironmentId,
      createEnvironment,
      updateEnvironment,
      deleteEnvironment,
      setActiveEnvironment,
    }))
  );

  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string>(activeEnvironmentId || "default");
  const [activeTab, setActiveTab] = useState<TabType>(data?.tab || "variables");

  const handleTabChange = useCallback((tab: TabType) => {
    hasAnimatedRef.current = true;
    setActiveTab(tab);
  }, []);

  const selectedEnvironment = environments[selectedEnvironmentId];

  const handleCreateEnvironment = useCallback(() => {
    const newId = createEnvironment({
      name: "New Environment",
    });
    setSelectedEnvironmentId(newId);
  }, [createEnvironment]);

  const handleDeleteEnvironment = useCallback(() => {
    if (selectedEnvironmentId === "default") {
      return;
    }
    deleteEnvironment(selectedEnvironmentId);
    setSelectedEnvironmentId("default");
  }, [selectedEnvironmentId, deleteEnvironment]);

  const handleUpdateName = useCallback(
    (name: string) => {
      updateEnvironment(selectedEnvironmentId, { name });
    },
    [selectedEnvironmentId, updateEnvironment]
  );

  const handleUpdateVariables = useCallback(
    (values: Record<string, Parameter>) => {
      const variables: Record<string, EnvironmentVariable> = {};
      Object.keys(values).forEach((key) => {
        const param = values[key];
        variables[key] = {
          id: param.id,
          name: param.name,
          value: param.value,
          isReadOnly: param.isReadOnly,
          isDisabled: param.isDisabled,
        };
      });

      updateEnvironment(selectedEnvironmentId, {
        data: {
          ...selectedEnvironment.data,
          variables,
        },
      });
    },
    [selectedEnvironmentId, selectedEnvironment, updateEnvironment]
  );

  const handleUpdateHeaders = useCallback(
    (values: Record<string, Parameter>) => {
      const headers: Record<string, EnvironmentVariable> = {};
      Object.keys(values).forEach((key) => {
        const param = values[key];
        headers[key] = {
          id: param.id,
          name: param.name,
          value: param.value,
          isReadOnly: param.isReadOnly,
          isDisabled: param.isDisabled,
        };
      });

      updateEnvironment(selectedEnvironmentId, {
        data: {
          ...selectedEnvironment.data,
          headers,
        },
      });
    },
    [selectedEnvironmentId, selectedEnvironment, updateEnvironment]
  );

  const handleSelectEnvironment = useCallback((envId: string) => {
    setSelectedEnvironmentId(envId);
    setActiveEnvironment(envId);
  }, [setActiveEnvironment]);

  // Convert environment variables to Parameter format for ListPropertyEditor
  // For non-default environments, merge with default values as placeholders
  const variablesAsParams: Record<string, Parameter> = React.useMemo(() => {
    if (!selectedEnvironment) return {};
    
    const result: Record<string, Parameter> = {};
    const defaultEnv = environments["default"];
    
    // If not default environment, show default values as placeholders
    if (!selectedEnvironment.isDefault && defaultEnv) {
      // First, add all default variables as placeholders with readonly keys
      Object.keys(defaultEnv.data.variables).forEach((key) => {
        const defaultVar = defaultEnv.data.variables[key];
        result[key] = {
          id: defaultVar.id,
          name: defaultVar.name,
          value: "",
          placeholder: defaultVar.value,
          isKeyReadOnly: true, // Key cannot be edited, inherited from default
        };
      });
    }
    
    // Then overlay current environment's variables
    Object.keys(selectedEnvironment.data.variables).forEach((key) => {
      const variable = selectedEnvironment.data.variables[key];
      result[key] = {
        id: variable.id,
        name: variable.name,
        value: variable.value,
        placeholder: result[key]?.placeholder,
        isKeyReadOnly: result[key]?.isKeyReadOnly, // Preserve readonly status if inherited
        isDisabled: variable.isDisabled,
      };
    });
    
    return result;
  }, [selectedEnvironment, environments]);

  const headersAsParams: Record<string, Parameter> = React.useMemo(() => {
    if (!selectedEnvironment) return {};
    
    const result: Record<string, Parameter> = {};
    const defaultEnv = environments["default"];
    
    // If not default environment, show default values as placeholders
    if (!selectedEnvironment.isDefault && defaultEnv) {
      // First, add all default headers as placeholders with readonly keys
      Object.keys(defaultEnv.data.headers).forEach((key) => {
        const defaultHeader = defaultEnv.data.headers[key];
        result[key] = {
          id: defaultHeader.id,
          name: defaultHeader.name,
          value: "",
          placeholder: defaultHeader.value,
          isKeyReadOnly: true, // Key cannot be edited, inherited from default
        };
      });
    }
    
    // Then overlay current environment's headers
    Object.keys(selectedEnvironment.data.headers).forEach((key) => {
      const header = selectedEnvironment.data.headers[key];
      result[key] = {
        id: header.id,
        name: header.name,
        value: header.value,
        placeholder: result[key]?.placeholder,
        isKeyReadOnly: result[key]?.isKeyReadOnly, // Preserve readonly status if inherited
        isDisabled: header.isDisabled,
      };
    });
    
    return result;
  }, [selectedEnvironment, environments]);

  return (
    <div className={styles.variableEditor}>
      <div className={styles.content}>
        <div className={styles.sidebar}>
          <div className={styles.header}>
            <div className={styles.title}>
              <h2>Environments</h2>
            </div>
            <IconButton size="small" onClick={handleCreateEnvironment} tooltip="Create Environment">
              <AddIcon size={18} />
            </IconButton>
          </div>
          <div className={styles.envList}>
            {Object.values(environments).map((env) => (
              <div
                key={env.id}
                className={`${styles.envItem} ${
                  selectedEnvironmentId === env.id ? styles.active : ""
                }`}
                onClick={() => handleSelectEnvironment(env.id)}
              >
                {selectedEnvironmentId === env.id && (
                  <motion.div
                    layoutId="activeEnvironmentBackground"
                    className={styles.activeBackground}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                )}
                {env.isDefault ? (
                  <span className={styles.envName}>{env.name}<LockIcon size={16} color="var(--color-font-light)"/></span>
                ) : (
                  <EditableInputField
                    value={env.name}
                    onChange={(name) => updateEnvironment(env.id, { name })}
                    onClick={() => handleSelectEnvironment(env.id)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        {selectedEnvironment && (
          <div className={styles.mainContent}>
            <div className={styles.envHeader}>
              {selectedEnvironment.isDefault ? (
                <h3 className={styles.envTitle}>{selectedEnvironment.name}</h3>
              ) : (
                <EditableInputField
                  value={selectedEnvironment.name}
                  onChange={handleUpdateName}
                  className={styles.envTitle}
                />
              )}
              <div className={styles.options}>
                {!selectedEnvironment.isDefault && (
                  <IconButton size="small" onClick={handleDeleteEnvironment} tooltip="Delete Environment">
                    <DeleteIcon size={18} />
                  </IconButton>
                )}
                <IconButton size="small" onClick={close} tooltip="Close">
                  <ClearIcon size={18} />
                </IconButton>
              </div>
            </div>
            
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === "variables" ? styles.active : ""}`}
                onClick={() => handleTabChange("variables")}
              >
                {activeTab === "variables" && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className={styles.activeTabIndicator}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 35,
                    }}
                  />
                )}
                <span className={styles.label}>Variables</span>
                {Object.keys(variablesAsParams).length > 0 && (
                  <span className={styles.indicator} />
                )}
              </button>
              <button
                className={`${styles.tab} ${activeTab === "headers" ? styles.active : ""}`}
                onClick={() => handleTabChange("headers")}
              >
                {activeTab === "headers" && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className={styles.activeTabIndicator}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 35,
                    }}
                  />
                )}
                <span className={styles.label}>Headers</span>
                {Object.keys(headersAsParams).length > 0 && (
                  <span className={styles.indicator} />
                )}
              </button>
            </div>

            <div className={styles.tabContent}>
              <AnimatePresence mode="wait">
                {activeTab === "variables" && (
                  <motion.div
                    key="variables"
                    initial={hasAnimatedRef.current ? { opacity: 0, x: -20 } : false}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{
                      duration: 0.2,
                      ease: "easeInOut",
                    }}
                  >
                    <ListPropertyEditor
                      title="Variable"
                      type="Variable"
                      value={variablesAsParams}
                      onChange={handleUpdateVariables}
                      disableRemoveItem={selectedEnvironment.isDefault ? false : undefined}
                    />
                  </motion.div>
                )}
                {activeTab === "headers" && (
                  <motion.div
                    key="headers"
                    initial={hasAnimatedRef.current ? { opacity: 0, x: 20 } : false}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{
                      duration: 0.2,
                      ease: "easeInOut",
                    }}
                  >
                    <ListPropertyEditor
                      title="Header"
                      type="Header"
                      value={headersAsParams}
                      onChange={handleUpdateHeaders}
                      disableRemoveItem={selectedEnvironment.isDefault ? false : undefined}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const useEnvironmentEditor = createDialog<unknown,{ tab?: TabType }>(EnvironmentEditor);
