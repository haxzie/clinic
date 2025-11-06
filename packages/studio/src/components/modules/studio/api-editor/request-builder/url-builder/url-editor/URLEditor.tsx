import React, { useEffect, useState, useMemo, useCallback } from "react";
import styles from "./URLEditor.module.scss";
import debounce from "lodash.debounce";
import { parseCurlCommand } from "@/utils/curlParser";
import useApiStore from "@/store/api-store/api.store";
import { RequestMethod, RequestParameters } from "@apiclinic/core";
import { useShallow } from "zustand/shallow";
import { generateUUID } from "@/utils/dataUtils";
import VariableInput from "@/components/modules/studio/variable-input/VariableInput";

/**
 * Decode a parameter value but preserve variable placeholders like {{variableName}}
 * If the value contains variable syntax, don't decode it
 */
const safeDecodeURIComponent = (str: string): string => {
  // If string contains variable placeholders, return as-is to preserve them
  if (/\{\{\w+\}\}/.test(str)) {
    return str;
  }
  
  // Otherwise, decode normally
  try {
    return decodeURIComponent(str);
  } catch {
    // If decoding fails, return original
    return str;
  }
};

/**
 * Extract query parameters from a URL and convert them to RequestParameters format
 */
const extractQueryParameters = (url: string): RequestParameters => {
  const parameters: RequestParameters = {};
  
  try {
    const urlObject = new URL(url);
    const searchParams = urlObject.searchParams;
    
    searchParams.forEach((value, name) => {
      const id = generateUUID();
      parameters[id] = {
        id,
        name,
        value,
      };
    });
  } catch (error) {
    console.error(error);
    // If URL parsing fails, try to extract parameters manually
    const queryIndex = url.indexOf('?');
    if (queryIndex !== -1) {
      const queryString = url.substring(queryIndex + 1);
      const pairs = queryString.split('&');
      
      pairs.forEach(pair => {
        const [name, value = ''] = pair.split('=');
        if (name) {
          const id = generateUUID();
          parameters[id] = {
            id,
            name: safeDecodeURIComponent(name),
            value: safeDecodeURIComponent(value),
          };
        }
      });
    }
  }
  
  return parameters;
};

/**
 * Compare two RequestParameters objects to see if they're different
 */
const areParametersDifferent = (params1: RequestParameters, params2: RequestParameters): boolean => {
  const keys1 = Object.keys(params1);
  const keys2 = Object.keys(params2);
  
  // Different number of parameters
  if (keys1.length !== keys2.length) {
    return true;
  }
  
  // Check if all parameters in params1 exist in params2 with same name and value
  for (const key1 of keys1) {
    const param1 = params1[key1];
    const matchingParam2 = Object.values(params2).find(p => p.name === param1.name);
    
    if (!matchingParam2 || matchingParam2.value !== param1.value) {
      return true;
    }
  }
  
  return false;
};

export default function URLEditor({
  value,
  onChange,
  onFocus,
  onBlur,
  apiId,
}: {
  value: string;
  onChange: (url: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  apiId: string;
}) {
  // Get store methods for curl parsing and current parameters
  const { setMethod, setHeaders, setParameters, setRequestBody, currentParameters } = useApiStore(
    useShallow((state) => ({
      setMethod: state.setMethod,
      setHeaders: state.setHeaders,
      setParameters: state.setParameters,
      setRequestBody: state.setRequestBody,
      currentParameters: state.apis[apiId]?.parameters || {},
    }))
  );
  const [currentUrl, setCurrentUrl] = useState(value);
  const debouncedSetUrl = useMemo(
    () => debounce((url: string) => onChange(url), 100),
    [onChange]
  );
  const debouncedSetParameters = useMemo(
    () => debounce((url: string) => {
      const parameters = extractQueryParameters(url);
      
      // Only update parameters if they're actually different to prevent infinite loops
      if (areParametersDifferent(parameters, currentParameters)) {
        setParameters(apiId, parameters);
      }
    }, 100),
    [apiId, setParameters, currentParameters]
  );

  // Handle input change
  const handleInputChange = (url: string) => {
    // trim the leading and trailing spaces
    const trimmedValue = url.trimStart();
    setCurrentUrl(trimmedValue);
    debouncedSetUrl(trimmedValue);
    
    // Extract and update query parameters (debounced)
    debouncedSetParameters(trimmedValue);
  };

  // Handle key down events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Ignore all key presses while Alt is pressed
    if (e.altKey) {
      e.preventDefault();
    }
  };

  // Handle paste events for curl commands
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    const pastedText = e.clipboardData.getData('text');
    
    // Check if it looks like a curl command
    if (pastedText.trim().toLowerCase().startsWith('curl ')) {
      e.preventDefault();
      
      const parsed = parseCurlCommand(pastedText);
      if (parsed) {
        // Update all the fields from the parsed curl command
        setMethod(apiId, parsed.method as RequestMethod);
        onChange(parsed.url);
        setCurrentUrl(parsed.url);
        
        if (Object.keys(parsed.headers).length > 0) {
          setHeaders(apiId, parsed.headers);
        }
        
        if (Object.keys(parsed.params).length > 0) {
          setParameters(apiId, parsed.params);
        }
        
        if (parsed.body) {
          setRequestBody(apiId, parsed.body);
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
  }, [apiId, onChange, setMethod, setHeaders, setParameters, setRequestBody]);

  useEffect(() => {
    setCurrentUrl(value);
  }, [value]);

  return (
    <div className={styles.URLEditor}>
      <VariableInput
        value={currentUrl}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder="https://example.com"
        spellCheck={false}
        onFocus={() => onFocus()}
        onBlur={() => onBlur()}
      />
    </div>
  );
}
