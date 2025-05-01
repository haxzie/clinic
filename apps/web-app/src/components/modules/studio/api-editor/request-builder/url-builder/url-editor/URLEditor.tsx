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
        <input
          ref={inputRef}
          type="text"
          value={path}
          onChange={handleInputChange}
          className={styles.input}
          spellCheck={false}
          onFocus={() => onFocus()}
          onBlur={() => onBlur()}
        />
      </div>
    </div>
  );
}
