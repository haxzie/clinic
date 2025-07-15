import React from "react";
import styles from "./RequestBodyEditor.module.scss";
import ContentEditor from "@/components/modules/studio/content-editor/ContentEditor";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import IconButton from "@/components/base/icon-button/IconButton";
import FormatIcon from "@/components/icons/FormatIcon";
import UploadIcon from "@/components/icons/UploadIcon";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";
import { DropDown } from "@/components/base/dropdown/DropDown";

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

  const handleRequestBodyTypeChange = ({ id }: { id: string }) => {
    setRequestBody({ contentType: id, content: requestBody.content });
  };

  const dropDownOptions = [
    {
      id: "none",
      value: "None",
      component: (
        <ContentEditor
          value={`${requestBody.content}`}
          onChange={handleRequestBodyChange}
        />
      ),
    },
    {
      id: "application/json",
      value: "application/json",
      component: (
        <ContentEditor
          contentType="application/json"
          value={`${requestBody.content}`}
          onChange={handleRequestBodyChange}
        />
      ),
    },
    {
      id: "application/xml",
      value: "application/xml",
      component: (
        <ContentEditor
          contentType="application/xml"
          value={`${requestBody.content}`}
          onChange={handleRequestBodyChange}
        />
      ),
    },
    {
      id: "text/plain",
      value: "text/plain",
      component: (
        <ContentEditor
          contentType="text/plain"
          value={`${requestBody.content}`}
          onChange={handleRequestBodyChange}
        />
      ),
    },
    {
      id: "multipart/form-data",
      value: "multipart/form-data",
      component: (
        <ContentEditor
          contentType="multipart/form-data"
          value={`${requestBody.content}`}
          onChange={handleRequestBodyChange}
        />
      ),
    },
    {
      id: "application/x-www-form-urlencoded",
      value: "application/x-www-form-urlencoded",
      component: (
        <ContentEditor
          contentType="multipart/form-data"
          value={`${requestBody.content}`}
          onChange={handleRequestBodyChange}
        />
      ),
    },
  ];

  const DropDownSelectElement = () => {
    return (
      <div className={styles.picker}>
        {requestBody.contentType}
        <ChevronDownIcon size={18} />
      </div>
    );
  };

  return (
    <div className={styles.requestBodyEditor}>
      <div className={styles.header}>
        <div className={styles.contentTypePicker}>
          Content Type:
          <DropDown
            value={dropDownOptions[0]}
            options={dropDownOptions}
            onChange={handleRequestBodyTypeChange}
            selectElement={DropDownSelectElement}
            showChevron={false}
          />
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
      <ContentEditor
        value={`${requestBody.content}`}
        onChange={handleRequestBodyChange}
      />
    </div>
  );
}
