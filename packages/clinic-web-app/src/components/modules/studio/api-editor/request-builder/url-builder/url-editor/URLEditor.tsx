import React, { useRef, useEffect } from "react";
import styles from "./URLEditor.module.scss";
import { useAPI } from "../../../api-context-provider/APIContextProvider";
import { useShallow } from "zustand/shallow";
import useApiStore from "@/store/api-store/api.store";

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

  const urlParts = (url: string) => {
    // Define the regex patterns for different URL components
    // Note: Using non-global regex for proper capturing groups

    // Matches protocol (http:// or https://)
    const protocolRegex = /^(https?:\/\/)/;

    // Authentication (username:password@)
    const authRegex = /^https?:\/\/([^@\/]+@)(?=[^\/]+)/;

    // Domain (including subdomain, excluding www if desired)
    const domainRegex = /^https?:\/\/(?:[^@\/]+@)?([^\/:#?]+)/;

    // Port number
    const portRegex = /:(\d+)(?=\/|$|[?#])/;

    // Path anything that starts with / and ends with ? or #, shouldn't be before a / or colon, also should not be a file name
    const pathRegex =
      /^https?:\/\/(?:[^@\/]+@)?[^\/:#?]+(?::\d+)?(\/.+?)(?=[?#]|$)/;

    // Query parameters
    const queryRegex = /(\?[^#]+)(?=#|$)/;

    // file name + extension
    const fileRegex = /\/([^/]+\.[^./?#]+)(?=[?#]|$)/;

    // Hash fragment
    const hashRegex = /(#.*)$/;

    // Define the parts to extract with their regex and class names
    const regexes = [
      {
        regex: protocolRegex,
        className: "protocol",
        group: 1,
      },
      {
        regex: authRegex,
        className: "auth",
        group: 1,
      },
      {
        regex: domainRegex,
        className: "domain",
        group: 1,
      },
      {
        regex: portRegex,
        className: "port",
        group: 0,
      },
      {
        regex: pathRegex,
        className: "path",
        group: 1,
      },
      {
        regex: queryRegex,
        className: "query",
        group: 1,
      },
      {
        regex: hashRegex,
        className: "hash",
        group: 1,
      },
    ];

    // Array to hold the extracted parts with their positions
    const highlightedURLParts: Array<{
      className: string;
      value: string;
      position: [number, number];
    }> = [];

    // Extract each part
    regexes.forEach((regexConfig) => {
      const match = url.match(regexConfig.regex);
      if (match && match[regexConfig.group]) {
        const value = match[regexConfig.group];
        // Find the actual position in the original URL string
        const position = url.indexOf(value);
        if (position !== -1) {
          // check if it's a filename
          if (regexConfig.className === "path") {
            const fileMatch = value.match(fileRegex);
            if (fileMatch && fileMatch[1]) {
              const fileName = fileMatch[1];
              const fileNamePosition = value.indexOf(fileName);
              highlightedURLParts.push({
                className: "path",
                value: value.substring(0, fileNamePosition),
                position: [position, position + fileNamePosition],
              });
              highlightedURLParts.push({
                className: "file",
                value: fileName,
                position: [
                  position + fileNamePosition,
                  position + fileNamePosition + fileName.length,
                ],
              });
              return;
            }
          }
          highlightedURLParts.push({
            className: regexConfig.className,
            value: value,
            position: [position, position + value.length],
          });
        }
      }
    });

    // Sort parts by their position to ensure correct order
    highlightedURLParts.sort((a, b) => a.position[0] - b.position[0]);

    return highlightedURLParts;
  };

  // Generate HTML for highlighting
  const generateHighlightedHtml = () => {
    const parts = urlParts(path);
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
    setPath(e.target.value);
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
