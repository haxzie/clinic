import React, { useRef, useEffect, useState, useMemo } from "react";
import styles from "./URLEditor.module.scss";
import debounce from "lodash.debounce";

export default function URLEditor({
  value,
  onChange,
  onFocus,
  onBlur,
}: {
  value: string;
  onChange: (url: string) => void;
  onFocus: () => void;
  onBlur: () => void;
}) {
  const [currentUrl, setCurrentUrl] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const debouncedSetUrl = useMemo(
    () => debounce((url: string) => onChange(url), 300),
    [onChange]
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // trim the leading and trailing spaces
    const trimmedValue = e.target.value.trimStart();
    setCurrentUrl(trimmedValue);
    debouncedSetUrl(trimmedValue);
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

  useEffect(() => {
    setCurrentUrl(value);
  }, [value]);

  return (
    <div className={styles.URLEditor}>
      <div className={styles.editorContainer}>
        <input
          ref={inputRef}
          type="text"
          value={currentUrl}
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
