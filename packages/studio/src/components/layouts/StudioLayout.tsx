import React from "react";
import styles from "./StudioLayout.module.scss";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={styles.studioLayout}>{children}</div>;
}
