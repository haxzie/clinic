import React, { useEffect } from "react";
import styles from "./JSONEditor.module.scss";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { tokyoNight } from "./themes/tokyoNight";
import { json } from "@codemirror/lang-json";
import { html } from "@codemirror/lang-html";
import { markdown } from "@codemirror/lang-markdown";
import * as prettier from "prettier/standalone";
import parserJson from "prettier/parser-json";


export default function JSONEditor({
  disabled = false,
  editable = true,
  value = "",
  placeholder = "",
  contentType = "application/json",
  onChange,
  autoFormat = false,
}: {
  disabled?: boolean;
  editable?: boolean;
  value?: string;
  placeholder?: string;
  contentType?: string;
  autoFormat?: boolean;
  onChange?: (value: string) => void;
}) {
  const fontSize = EditorView.theme({
    "&": {
      fontSize: "14px",
    },
  });

  const handleChange = (value: string) => {
    if (onChange) {
      onChange(value);
    }
  };

  const getLanguageForContentType = (contentType: string) => {
    // split and remove utf-8
    const [type] = contentType.split(";");

    switch (type) {
      case "application/json":
        return json();
      case "text/html":
        return html();
      case "text/plain":
      case "text/markdown":
        return markdown();
      default:
        return json();
    }
  };

  return (
    <div className={[styles.responseViewer, "editor-config"].join(" ")}>
      <CodeMirror
        editable={editable && !disabled}
        value={value || ""}
        placeholder={placeholder}
        height="100%"
        theme={tokyoNight}
        extensions={[fontSize, getLanguageForContentType(contentType)]}
        onChange={handleChange}
      />
    </div>
  );
}
