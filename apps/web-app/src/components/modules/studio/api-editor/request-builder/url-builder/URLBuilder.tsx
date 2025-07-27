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

export default function URLBuilder({ apiId }: { apiId: string }) {
  const [focused, setFocused] = React.useState(false);
  const { method, isLoading, setMethod, makeHTTPRequest, url, setUrl } =
    useApiStore(
      useShallow((state) => ({
        url: state.apis[apiId].url,
        setUrl: state.setUrl,
        method: state.apis[apiId].method,
        isLoading: state.apis[apiId].isLoading,
        setMethod: state.setMethod,
        makeHTTPRequest: state.makeHTTPRequest,
      }))
    );

  const handleMethodChange = useCallback(
    (method: RequestMethod) => {
      setMethod(apiId, method);
    },
    [setMethod]
  );

  const handleUrlChange = useCallback(
    (url: string) => {
      setUrl(apiId, url);
    },
    [setUrl]
  );

  /**
   * Handle keyboard events for the URL builder
   */
  const handleCmdEnter = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Enter" && event.metaKey) {
        event.preventDefault();
        makeHTTPRequest(apiId);
      }
    },
    [makeHTTPRequest, apiId]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleCmdEnter);
    return () => {
      window.removeEventListener("keydown", handleCmdEnter);
    };
  }, [handleCmdEnter, apiId]);

  return (
    <div className={[styles.urlBuilder, focused && styles.focused].join(" ")}>
      <MethodPicker value={method} onChange={handleMethodChange} />
      <URLEditor
        apiId={apiId}
        value={url}
        onChange={handleUrlChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <div className={styles.options}>
        <CopyOptions apiId={apiId} />
        <Button onClick={() => makeHTTPRequest(apiId)} loading={isLoading}>
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
