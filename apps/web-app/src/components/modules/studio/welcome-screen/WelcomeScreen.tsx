import React from "react";
import styles from "./WelcomeScreen.module.scss";
import AddIcon from "@/components/icons/AddIcon";
import AddFolderIcon from "@/components/icons/AddFolderIcon";

export default function WelcomeScreen() {
  const actions = [
    {
      title: "Create a new API",
      icon: AddIcon,
      shortCut: ["alt", "n"],
    },
    {
      title: "Create a new API Collection",
      icon: AddFolderIcon,
      shortCut: ["alt", "shift", "n"],
    }
  ];
  return (
    <div className={styles.welcomeView}>
      <div className={styles.content}>
        <div className={styles.actions}>
          {actions.map((action, index) => (
            <div key={index} className={styles.action}>
              <div className={styles.icon}>
                <action.icon size={18}/>
              </div>
              <p className={styles.text}>
                {action.title}
              </p>
              <span className={styles.shortcut}>
                {action.shortCut.join(" + ")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
