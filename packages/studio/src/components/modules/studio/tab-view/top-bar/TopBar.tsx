import React from "react";
import styles from "./TopBar.module.scss";
import Tabs from "./tabs/Tabs";
import VariableIcon from "@/components/icons/VariableIcon";
import ArrowUpDownIcon from "@/components/icons/ArrowUpDownIcon";
import { useEnvironmentEditor } from "../../variable-editor/EnvironmentEditor";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";

export default function TopBar() {
  const { open, isOpen } = useEnvironmentEditor();
  const { activeEnvironment } = useApiStore(
    useShallow(({ environments, activeEnvironmentId }) => ({
      activeEnvironment: environments[activeEnvironmentId],
    }))
  );

  return (
    <div className={styles.topBar}>
      <Tabs />

      <div className={styles.options}>
        <button
          className={styles.envButton}
          onClick={() => open()}
          disabled={isOpen}
        >
          <VariableIcon size={18} />
          <span>{activeEnvironment?.name || "Environment"}</span>
          <ArrowUpDownIcon size={20} />
        </button>
      </div>
    </div>
  );
}
