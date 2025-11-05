import React from "react";
import styles from "./HtmlRenderer.module.scss";

interface HtmlRendererProps {
  content: string;
}

export default function HtmlRenderer({ content }: HtmlRendererProps) {
  return (
    <div className={styles.htmlContainer}>
      <iframe
        className={styles.htmlFrame}
        srcDoc={content}
        title="HTML Response"
        sandbox="allow-same-origin"
      />
    </div>
  );
}

