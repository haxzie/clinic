import React, { useState } from "react";
import styles from "./TopBar.module.scss";
import EnvironmentModal from "../../modals/environment-modal/EnvironmentModal";
import ArrowUpDownIcon from "@/components/icons/ArrowUpDownIcon";
import VariableIcon from "@/components/icons/VariableIcon";
import APIDetails from "../api-details/APIDetails";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";

export default function TopBar() {
  const [showEnvModal, setShowEnvModal] = useState(false);
  const { activeAPI } = useApiStore(
    useShallow(({ activeAPI }) => ({ activeAPI }))
  );

  return (
    <div className={styles.topBar}>
      {/* <APITabs /> */}
      <APIDetails apiId={activeAPI} />
      <div className={styles.options}>
        <button
          className={styles.envButton}
          onClick={() => setShowEnvModal(true)}
        >
          <VariableIcon size={18} />
          <span>Environment</span>
          <ArrowUpDownIcon size={20} />
        </button>
      </div>
      {showEnvModal && (
        <EnvironmentModal onClose={() => setShowEnvModal(false)} />
      )}
    </div>
  );
}
