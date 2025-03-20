import React from "react";
import styles from "./JSONEditor.module.scss";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { tokyoNight } from "./themes/tokyoNight";
import { json } from "@codemirror/lang-json";

export default function JSONEditor({
  disabled = false,
  editable = true,
  value = "",
  placeholder = "",
  onChange,
}: {
  disabled?: boolean;
  editable?: boolean;
  value?: string;
  placeholder?: string;
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

  return (
    <div className={[styles.responseViewer, "editor-config"].join(" ")}>
      <CodeMirror
        editable={editable && !disabled}
        value={value || ""}
        placeholder={placeholder}
        height="100%"
        theme={tokyoNight}
        extensions={[fontSize, json()]}
        onChange={handleChange}
      />
    </div>
  );
}
