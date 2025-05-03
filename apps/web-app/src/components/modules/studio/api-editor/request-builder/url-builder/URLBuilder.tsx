import React, { useCallback, useEffect } from "react";
import styles from "./URLBuilder.module.scss";
import CommandIcon from "@/components/icons/CommandIcon";
import EnterIcon from "@/components/icons/EnterIcon";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";
import URLEditor from "./url-editor/URLEditor";
import { RequestMethod } from "@apiclinic/core";
import Button from "@/components/base/button/Button";
import MethodPicker from "./method-picker/MethodPicker";
import CopyOptions from "./copy-options/CopyOptions";

export default function URLBuilder() {
  const [focused, setFocused] = React.useState(false);
  const {
    activeAPI,
    method,
    isLoading,
    setMethod,
    makeHTTPRequest,
    url,
    setUrl,
  } = useApiStore(
    useShallow((state) => ({
      activeAPI: state.activeAPI,
      url: state.apis[state.activeAPI].url,
      setUrl: state.setUrl,
      method: state.apis[state.activeAPI].method,
      isLoading: state.apis[state.activeAPI].isLoading,
      setMethod: state.setMethod,
      makeHTTPRequest: state.makeHTTPRequest,
    }))
  );

  const handleMethodChange = useCallback(
    (method: RequestMethod) => {
      setMethod(method);
    },
    [setMethod]
  );
  /**
   * Handle keyboard events for the URL builder
   */
  const handleCmdEnter = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Enter" && event.metaKey) {
        event.preventDefault();
        makeHTTPRequest(activeAPI);
      }
    },
    [makeHTTPRequest, activeAPI]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleCmdEnter);
    return () => {
      window.removeEventListener("keydown", handleCmdEnter);
    };
  }, [handleCmdEnter, activeAPI]);

  return (
    <div className={[styles.urlBuilder, focused && styles.focused].join(" ")}>
      <MethodPicker value={method} onChange={handleMethodChange} />
      <URLEditor
        value={url}
        onChange={setUrl}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <div className={styles.options}>
        <CopyOptions apiId={activeAPI} />
        <Button onClick={() => makeHTTPRequest(activeAPI)} loading={isLoading}>
          Send
          <span className={styles.buttonIcons}>
            <CommandIcon size={14} />
            <EnterIcon size={18} />
          </span>
        </Button>
      </div>
    </div>
  );
}
