import React from "react";
import styles from "./SvgRenderer.module.scss";

interface SvgRendererProps {
  content: string;
}

export default function SvgRenderer({ content }: SvgRendererProps) {
  const svgDataUri = `data:image/svg+xml;base64,${btoa(content)}`;

  return (
    <div className={styles.svgContainer}>
      <img 
        src={svgDataUri} 
        alt="SVG content" 
        className={styles.svgImage}
      />
    </div>
  );
}

