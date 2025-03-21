import React from "react";
import styles from "./URLBuilder.module.scss";
import CommandIcon from "@/components/icons/CommandIcon";
import EnterIcon from "@/components/icons/EnterIcon";
import CopyIcon from "@/components/icons/CopyIcon";
import IconButton from "@/components/base/icon-button/IconButton";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import { useAPI } from "../../api-context-provider/APIContextProvider";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";
import URLEditor from "./url-editor/URLEditor";
import { RequestMethod } from "@apiclinic/core";
import Button from "@/components/base/button/Button";

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

  const handleCopyURL = () => {
    // Copy URL to clipboard
    navigator.clipboard.writeText(useApiStore.getState().apis[apiId].path);
  };

  return (
    <div className={[styles.urlBuilder, focused && styles.focused].join(" ")}>
      <div
        className={styles.methodPicker}
        onClick={() => handleMethodChange("POST")}
      >
        <span>{method}</span>
        <ChevronDownIcon size={16} />
      </div>
      <URLEditor
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <div className={styles.options}>
        <IconButton
          size="small"
          tooltip="Copy URL"
          onClick={handleCopyURL}
          showSuccess
        >
          <CopyIcon size={16} />
        </IconButton>
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
