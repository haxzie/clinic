import React, { useState } from "react";
import styles from "./EnvironmentModal.module.scss";
import Modal from "@/components/base/modal/Modal";
import IconButton from "@/components/base/icon-button/IconButton";
import ClearIcon from "@/components/icons/ClearIcon";
import VariableIcon from "@/components/icons/VariableIcon";
import CheckIcon from "@/components/icons/CheckIcon";
import ListPropertyEditor from "../../api-editor/request-builder/request-properties/shared/list-property-editor/ListPropertyEditor";

export default function EnvironmentModal({ onClose }: { onClose: () => void }) {
  const [selectedEnvironment, setSelectedEnvironment] = React.useState<
    keyof typeof envs | null
  >("local");

  const [values, setValues] = useState<
    Record<
      string,
      {
        id: string;
        name: string;
        value: string;
        isReadOnly?: boolean;
      }
    >
  >({
    database_url: {
      id: "database_url",
      name: "database_url",
      value: "localhost:5432",
    },
  });

  const envs = {
    default: {
      id: "default",
      name: "Default",
      fileName: ".env",
    },
    local: {
      id: "local",
      name: "Local",
      fileName: ".env.local",
    },
    dev: {
      id: "dev",
      name: "Development",
      fileName: ".env.dev",
    },
    staging: {
      id: "staging",
      name: "Staging",
      fileName: ".env.staging",
    },
    prod: {
      id: "prod",
      name: "Production",
      fileName: ".env.prod",
    },
  };

  return (
    <Modal onClickOutside={onClose}>
      <div className={styles.environmentModal}>
        <div className={styles.header}>
          <div className={styles.title}>
            <VariableIcon size={18} />
            <h2>
              Environment
            </h2>
          </div>
          <IconButton size="small" onClick={onClose}>
            <ClearIcon size={18} />
          </IconButton>
        </div>
        <div className={styles.content}>
          <div className={styles.sidebar}>
            {Object.values(envs).map((env) => (
              <div
                key={env.id}
                className={`${styles.envItem} ${
                  selectedEnvironment === env.id ? styles.active : ""
                }`}
                onClick={() => setSelectedEnvironment(env.id as keyof typeof envs)}
              >
                <span>{env.name}</span>
                {selectedEnvironment === env.id && (
                  <div className={styles.icon}>
                    <CheckIcon size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>
          {selectedEnvironment && (
            <div className={styles.content}>
              <div className={styles.envHeader}>
                <h3>{envs[selectedEnvironment!].name}</h3>
                <span>{envs[selectedEnvironment!].fileName}</span>
              </div>
              <ListPropertyEditor
                title="Variable"
                type="Environment"
                value={values}
                onChange={(values) => setValues(values)}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
