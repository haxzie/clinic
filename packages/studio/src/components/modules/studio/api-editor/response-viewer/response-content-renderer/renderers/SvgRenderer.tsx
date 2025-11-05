import React from "react";
import styles from "./SvgRenderer.module.scss";

interface SvgRendererProps {
  content: string;
}

export default function SvgRenderer({ content }: SvgRendererProps) {
  return (
    <div className={styles.svgContainer}>
      <div
        className={styles.svgWrapper}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}

