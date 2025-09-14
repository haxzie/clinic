import React from "react";
import styles from "./StudioLayout.module.scss";
import "@/styles/global.scss";

// tokens are now bundled via the package-level CSS; no direct global import here
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={["apiclinic-studio", styles.studioLayout].join(" ")}>{children}</div>
  );
}
