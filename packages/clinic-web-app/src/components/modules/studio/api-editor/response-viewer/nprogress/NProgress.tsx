import React from "react";
import styles from "./NProgress.module.scss";

export default function NProgress({ active }: { active?: boolean }) {
  return (
    <div
      className={[styles.nprogress, active ? styles.active : ""].join(" ")}
    ></div>
  );
}
