import React from "react";
import styles from "./RequestBodyEditor.module.scss";
import JSONEditor from "@/components/modules/studio/json-editor/JSONEditor";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import IconButton from "@/components/base/icon-button/IconButton";
import FormatIcon from "@/components/icons/FormatIcon";
import UploadIcon from "@/components/icons/UploadIcon";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";

export default function RequestBodyEditor() {
  const { requestBody, setRequestBody } = useApiStore(
    useShallow((state) => ({
      requestBody: state.apis[state.activeAPI].requestBody,
      setRequestBody: state.setRequestBody,
    }))
  );

  const handleRequestBodyChange = (value: string) => {
    setRequestBody({ ...requestBody, content: value });
  };

  return (
    <div className={styles.requestBodyEditor}>
      <div className={styles.header}>
        <div className={styles.contentTypePicker}>
          Content Type:
          <div className={styles.picker}>
            application/json
            <ChevronDownIcon size={18} />
          </div>
        </div>

        <div className={styles.options}>
          <IconButton
            size="small"
            className={styles.icon}
            tooltip="Prettyify"
            showSuccess
          >
            <FormatIcon size={18} />
          </IconButton>
          <IconButton
            size="small"
            className={styles.icon}
            tooltip="Upload Request Body"
            tooltipPosition="left"
          >
            <UploadIcon size={18} />
          </IconButton>
        </div>
      </div>
      <JSONEditor
        value={`${requestBody.content}`}
        onChange={handleRequestBodyChange}
      />
    </div>
  );
}
