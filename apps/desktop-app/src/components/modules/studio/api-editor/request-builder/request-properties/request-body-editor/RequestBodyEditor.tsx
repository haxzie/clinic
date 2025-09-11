import React, { useCallback, useRef } from "react";
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
import { Events, track } from "@/lib/analytics";

export default function RequestBodyEditor({ apiId }: { apiId: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const prettyify = useCallback(() => {
    if (requestBody.contentType === "application/json" && requestBody.content) {
      try {
        const prettyContent = JSON.stringify(
          JSON.parse(requestBody?.content),
          null,
          2
        );
        setRequestBody(apiId, {
          contentType: "application/json",
          content: prettyContent,
        });
      } catch (error) {
        console.error(error);
      }
      track(Events.API_REQUEST_BODY_PRETTIFIED, {});
    }
  }, [requestBody, setRequestBody, apiId]);

  const uploadRequestBody = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const fileName = file.name.toLowerCase();

        let contentType = "text/plain";
        let processedContent = content;

        // Detect file type based on extension and content
        if (
          fileName.endsWith(".json") ||
          content.trim().startsWith("{") ||
          content.trim().startsWith("[")
        ) {
          try {
            // Try to parse as JSON to validate
            JSON.parse(content);
            contentType = "application/json";
            // Pretty print JSON
            processedContent = JSON.stringify(JSON.parse(content), null, 2);
          } catch (error) {
            console.log(error);
            // If JSON parsing fails, keep as plain text
            contentType = "text/plain";
          }
        } else if (
          fileName.endsWith(".xml") ||
          content.trim().startsWith("<")
        ) {
          contentType = "application/xml";
        } else if (
          fileName.endsWith(".txt") ||
          fileName.endsWith(".md") ||
          fileName.endsWith(".log")
        ) {
          contentType = "text/plain";
        }

        // Update the request body with new content and type
        setRequestBody(apiId, {
          contentType,
          content: processedContent,
        });
      };

      reader.readAsText(file);

      // Reset the file input
      if (event.target) {
        event.target.value = "";
      }
      track(Events.API_REQUEST_BODY_UPLOADED, {
        extension: file.name.split(".").pop() || "unknown",
      });
    },
    [apiId, setRequestBody]
  );

  const selectedOption =
    dropDownOptions.find((option) => option.id === requestBody.contentType) ||
    dropDownOptions[0];

  return (
    <div className={styles.requestBodyEditor}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.xml,.txt,.md,.log"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />
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
            disabled={
              requestBody.contentType === "none" ||
              requestBody.contentType === "application/xml" ||
              requestBody.contentType === "text/plain"
            }
            showSuccess
            onClick={prettyify}
          >
            <FormatIcon size={18} />
          </IconButton>
          <IconButton
            size="small"
            className={styles.icon}
            tooltip="Upload Request Body"
            tooltipPosition="left"
            onClick={uploadRequestBody}
          >
            <UploadIcon size={18} />
          </IconButton>
        </div>
      </div>
      {selectedOption.component}
    </div>
  );
}
