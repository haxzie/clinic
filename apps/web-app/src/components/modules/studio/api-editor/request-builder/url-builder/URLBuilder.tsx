import React, { useCallback, useEffect } from "react";
import styles from "./URLBuilder.module.scss";
import CommandIcon from "@/components/icons/CommandIcon";
import EnterIcon from "@/components/icons/EnterIcon";
import { useAPI } from "../../api-context-provider/APIContextProvider";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";
import URLEditor from "./url-editor/URLEditor";
import { RequestMethod } from "@apiclinic/core";
import Button from "@/components/base/button/Button";
import MethodPicker from "./method-picker/MethodPicker";
import CopyOptions from "./copy-options/CopyOptions";

export default function URLBuilder() {
  const [focused, setFocused] = React.useState(false);
  const { apiId, setMethod, makeHTTPRequest } = useAPI();
  const { method, isLoading } = useApiStore(
    useShallow((state) => ({
      method: state.apis[apiId].method,
      isLoading: state.apis[apiId].isLoading,
    }))
  );

  const handleMethodChange = (method: RequestMethod) => {
    setMethod(method);
  };
  /**
   * Handle keyboard events for the URL builder
   */
  const handleCmdEnter = useCallback((event: KeyboardEvent) => {
    if (event.key === "Enter" && event.metaKey) {
      event.preventDefault();
      makeHTTPRequest();
    }
  }, [makeHTTPRequest]);

  useEffect(() => {
    window.addEventListener("keydown", handleCmdEnter);
    return () => {
      window.removeEventListener("keydown", handleCmdEnter);
    };
  }, [handleCmdEnter]);

  return (
    <div className={[styles.urlBuilder, focused && styles.focused].join(" ")}>
      <MethodPicker value={method} onChange={handleMethodChange} />
      <URLEditor
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <div className={styles.options}>
        <CopyOptions apiId={apiId} />
        <Button onClick={makeHTTPRequest} loading={isLoading}>
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
