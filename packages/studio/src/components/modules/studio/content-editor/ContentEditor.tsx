import styles from "./ContentEditor.module.scss";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { tokyoNight } from "./themes/tokyoNight";
import { json } from "@codemirror/lang-json";
import { html } from "@codemirror/lang-html";
import { markdown } from "@codemirror/lang-markdown";
import { xml } from "@codemirror/lang-xml";
import { linkifyPlugin } from "./plugins/linkify";
import "./CodeMirrorReset.scss";

export default function ContentEditor({
  disabled = false,
  editable = true,
  value = "",
  placeholder = "",
  contentType = "application/json",
  onChange,
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
      fontFamily: "Fira Code, monospace",
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
      case "application/xml":
      case "text/xml":
        return xml();
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
        extensions={[
          fontSize,
          getLanguageForContentType(contentType),
          linkifyPlugin(),
        ]}
        onChange={handleChange}
      />
    </div>
  );
}
