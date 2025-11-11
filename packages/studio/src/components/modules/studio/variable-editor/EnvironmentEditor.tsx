import React, { useState, useCallback, useRef } from "react";
import styles from "./EnvironmentEditor.module.scss";
import IconButton from "@/components/base/icon-button/IconButton";
import ClearIcon from "@/components/icons/ClearIcon";
import { createDialog, TProps } from "@/hooks/useDialog";
import AddIcon from "@/components/icons/AddIcon";
import DeleteIcon from "@/components/icons/DeleteIcon";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";
import EditableInputField from "../explorer-panel/file-tree/editable-input-field/EditableInputField";
import { motion, AnimatePresence } from "motion/react";
import LockIcon from "@/components/icons/LockIcon";
import VariableEditorTab from "./VariableEditorTab";
import HeaderEditorTab from "./HeaderEditorTab";

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

  const handleSelectEnvironment = useCallback((envId: string) => {
    setSelectedEnvironmentId(envId);
    setActiveEnvironment(envId);
  }, [setActiveEnvironment]);

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
                {selectedEnvironment && Object.keys(selectedEnvironment.data.variables).length > 0 && (
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
                {selectedEnvironment && Object.keys(selectedEnvironment.data.headers).length > 0 && (
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
                    <VariableEditorTab selectedEnvironmentId={selectedEnvironmentId} />
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
                    <HeaderEditorTab selectedEnvironmentId={selectedEnvironmentId} />
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
