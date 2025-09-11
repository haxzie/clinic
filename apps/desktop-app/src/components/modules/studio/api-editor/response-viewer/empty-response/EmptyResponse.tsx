import React from "react";
import styles from "./EmptyResponse.module.scss";
import CommandIcon from "@/components/icons/CommandIcon";
import EnterIcon from "@/components/icons/EnterIcon";

export default function EmptyResponse() {
  return (
    <div className={styles.emptyResponse}>
      <h4 className={styles.title}>Hit send to get a response</h4>
      <p className={styles.commandHint}>
        <span>
          <CommandIcon size={18} />
        </span>
        <span>
          <EnterIcon size={18} />
        </span>
      </p>
    </div>
  );
}
