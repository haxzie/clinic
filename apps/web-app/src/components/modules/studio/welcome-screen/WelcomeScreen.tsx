import React from "react";
import styles from "./WelcomeScreen.module.scss";
import AddIcon from "@/components/icons/AddIcon";
import AddFolderIcon from "@/components/icons/AddFolderIcon";
import UploadIcon from "@/components/icons/UploadIcon";
import PackageIcon from "@/components/icons/PackageIcon";

export default function WelcomeScreen() {
  const actions = [
    {
      title: "Create a new API",
      icon: AddIcon,
      shortCut: ["ctrl", "n"],
    },
    {
      title: "Create a new API Collection",
      icon: AddFolderIcon,
      shortCut: ["ctrl", "shift", "n"],
    },
    {
      title: "Import an API",
      icon: UploadIcon,
      shortCut: ["ctrl", "i"],
    },
    {
      title: "Import an API Collection",
      icon: PackageIcon,
      shortCut: ["ctrl", "shift", "i"],
    },
  ];
  return (
    <div className={styles.welcomeView}>
      <div className={styles.content}>
        <h1 className={styles.title}>Welcome to API Clinic</h1>
        <p className={styles.description}>
          Get started with working on your APIs using the following actions
        </p>

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
