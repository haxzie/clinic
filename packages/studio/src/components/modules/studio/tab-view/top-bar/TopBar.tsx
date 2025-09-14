import React from "react";
import styles from "./TopBar.module.scss";
import Tabs from "./tabs/Tabs";
// import IconButton from "@/components/base/icon-button/IconButton";
// import AddIcon from "@/components/icons/AddIcon";
// import { useEditor } from "@tiptap/react";
// import { useEditorStore } from "@/store/editor-store/editor.store";
// import { TabTypes } from "@/store/editor-store/editor.types";
// import useApiStore from "@/store/api-store/api.store";

export default function TopBar() {
  // const [showEnvModal, setShowEnvModal] = useState(false);


  return (
    <div className={styles.topBar}>
      {/* <div className={styles.left}> */}
      <Tabs />

      {/* <div className={styles.options}>
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
      )}  */}
    </div>
  );
}
