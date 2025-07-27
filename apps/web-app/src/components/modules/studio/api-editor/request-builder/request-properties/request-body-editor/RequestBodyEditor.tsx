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
import FormDataEditor from "../form-data-editor/FormDataEditor";

export default function RequestBodyEditor({ apiId }: { apiId: string }) {
  const { requestBody, setRequestBody } = useApiStore(
    useShallow((state) => ({
      requestBody: state.apis[apiId].requestBody,
      setRequestBody: state.setRequestBody,
    }))
  );

  const handleRequestBodyChange = (value: string) => {
    setRequestBody(apiId, { ...requestBody, content: value });
  };

  const handleRequestBodyTypeChange = ({ id }: { id: string }) => {
    // Reset content based on the selected content type
    let defaultContent = "";
    
    switch (id) {
      case "application/json":
        defaultContent = "{}";
        break;
      case "multipart/form-data":
      case "application/x-www-form-urlencoded":
        defaultContent = "{}"; // Empty JSON for form data
        break;
      case "application/xml":
        defaultContent = "";
        break;
      case "text/plain":
        defaultContent = "";
        break;
      case "none":
      default:
        defaultContent = "";
        break;
    }
    
    setRequestBody(apiId, { contentType: id, content: defaultContent });
  };

  const dropDownOptions = [
    {
      id: "none",
      value: "none",
      component: (
        <ContentEditor
          value={`${requestBody.content}`}
          onChange={handleRequestBodyChange}
          editable={false}
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
        <FormDataEditor
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
        <FormDataEditor
          contentType="application/x-www-form-urlencoded"
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

  const selectedOption = dropDownOptions.find(
    (option) => option.id === requestBody.contentType
  ) || dropDownOptions[0];

  return (
    <div className={styles.requestBodyEditor}>
      <div className={styles.header}>
        <div className={styles.contentTypePicker}>
          Content Type:
          <DropDown
            value={selectedOption}
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
      {selectedOption.component}
    </div>
  );
}
