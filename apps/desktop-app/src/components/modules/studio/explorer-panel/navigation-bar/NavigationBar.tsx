import React from "react";
import styles from "./NavigationBar.module.scss";
import LogoIcon from "@/components/icons/LogoIcon";

export default function NavigationBar() {
  return (
    <div className={styles.navigationBar}>
      <div className={styles.branding}>
        <LogoIcon size={20} />
      </div>
    </div>
  );
}
