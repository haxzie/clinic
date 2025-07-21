import React, { useRef, useEffect, useState, useMemo } from "react";
import styles from "./URLEditor.module.scss";
import debounce from "lodash.debounce";
import { parseCurlCommand } from "@/utils/curlParser";
import useApiStore from "@/store/api-store/api.store";
import { RequestMethod } from "@apiclinic/core";
import { useShallow } from "zustand/shallow";

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
  // Get store methods for curl parsing
  const { setMethod, setHeaders, setParameters, setRequestBody } = useApiStore(
    useShallow((state) => ({
      setMethod: state.setMethod,
      setHeaders: state.setHeaders,
      setParameters: state.setParameters,
      setRequestBody: state.setRequestBody,
    }))
  );
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

  // Handle key down events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Ignore all key presses while Alt is pressed
    if (e.altKey) {
      e.preventDefault();
    }
  };

  // Handle paste events for curl commands
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    
    // Check if it looks like a curl command
    if (pastedText.trim().toLowerCase().startsWith('curl ')) {
      e.preventDefault();
      
      const parsed = parseCurlCommand(pastedText);
      if (parsed) {
        // Update all the fields from the parsed curl command
        setMethod(parsed.method as RequestMethod);
        onChange(parsed.url);
        setCurrentUrl(parsed.url);
        
        if (Object.keys(parsed.headers).length > 0) {
          setHeaders(parsed.headers);
        }
        
        if (Object.keys(parsed.params).length > 0) {
          setParameters(parsed.params);
        }
        
        if (parsed.body) {
          setRequestBody(parsed.body);
        }
        
        // Show success feedback
        console.log('✅ Curl command parsed and populated:', {
          method: parsed.method,
          url: parsed.url,
          headers: Object.keys(parsed.headers).length,
          hasBody: !!parsed.body,
          params: Object.keys(parsed.params).length
        });
        
        // You could add a toast notification here if you have a toast system
        // toast.success('Curl command imported successfully!');
      } else {
        // If parsing failed, just paste as normal text
        console.warn('Failed to parse curl command');
      }
    }
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
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          className={styles.input}
          spellCheck={false}
          onFocus={() => onFocus()}
          onBlur={() => onBlur()}
        />
      </div>
    </div>
  );
}
