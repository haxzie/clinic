import React, { useRef, useEffect } from "react";
import styles from "./URLEditor.module.scss";
import { useAPI } from "../../../api-context-provider/APIContextProvider";
import { useShallow } from "zustand/shallow";
import useApiStore from "@/store/api-store/api.store";
import urlParser from "@/utils/urlParser";

export default function URLEditor({
  onFocus,
  onBlur,
}: {
  onFocus: () => void;
  onBlur: () => void;
}) {
  const { apiId, setPath } = useAPI();
  const { path } = useApiStore(
    useShallow((state) => ({
      path: state.apis[apiId].path,
    }))
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Generate HTML for highlighting
  const generateHighlightedHtml = () => {
    const parts = urlParser(path);
    let html = "";
    let lastIndex = 0;

    parts.forEach((part) => {
      // Add any text between the last part and this one
      if (part.position[0] > lastIndex) {
        const textBefore = path.substring(lastIndex, part.position[0]);
        // Process variables in the text before the URL part
        html += processVariables(textBefore);
      }
      // Process the part value for variables and add it with its class
      html += `<span class="${styles[part.className]}">${processVariables(
        part.value
      )}</span>`;

      lastIndex = part.position[1];
    });

    // Add any remaining text
    if (lastIndex < path.length) {
      const textAfter = path.substring(lastIndex);
      // Process variables in any remaining text
      html += processVariables(textAfter);
    }

    return html;
  };

  // Process variables in text
  const processVariables = (text: string) => {
    // Variable placeholders in curly braces
    const variableRegex = /{([^}]+)}/g;

    // Replace all variables with highlighted spans
    return text.replace(
      variableRegex,
      `<span class="${styles.variable}">{$1}</span>`
    );
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // trim the leading and trailing spaces
    const trimmedValue = e.target.value.trimStart();
    setPath(trimmedValue);
  };

  // Sync input and overlay scroll positions
  useEffect(() => {
    const syncScroll = () => {
      if (overlayRef.current && inputRef.current) {
        overlayRef.current.scrollLeft = inputRef.current.scrollLeft;
      }
    };

    const input = inputRef.current;
    if (input) {
      input.addEventListener("scroll", syncScroll);
    }

    return () => {
      if (input) {
        input.removeEventListener("scroll", syncScroll);
      }
    };
  }, []);

  return (
    <div className={styles.URLEditor}>
      <div className={styles.editorContainer}>
        {/* Overlay with highlighted text */}
        <div
          ref={overlayRef}
          className={styles.highlightOverlay}
          dangerouslySetInnerHTML={{ __html: generateHighlightedHtml() }}
        />

        {/* Input field with transparent text but visible cursor */}
        <input
          ref={inputRef}
          type="text"
          value={path}
          onChange={handleInputChange}
          className={styles.transparentInput}
          spellCheck={false}
          onFocus={() => onFocus()}
          onBlur={() => onBlur()}
        />
      </div>
    </div>
  );
}
