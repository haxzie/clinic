import React, { useMemo } from "react";
import styles from "./FormDataEditor.module.scss";
import ListPropertyEditor from "../shared/list-property-editor/ListPropertyEditor";

type Parameter = {
  id: string;
  name: string;
  value: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
};

interface FormDataEditorProps {
  contentType: "application/x-www-form-urlencoded" | "multipart/form-data";
  value: string;
  onChange: (value: string) => void;
}

export default function FormDataEditor({ contentType, value, onChange }: FormDataEditorProps) {
  const isMultipart = contentType === "multipart/form-data";
  const title = isMultipart ? "Form Data" : "Form Fields";

  // Convert JSON string to Parameter format
  const parameters = useMemo(() => {
    if (!value) return {};
    
    try {
      const parsed = JSON.parse(value);
      const result: Record<string, Parameter> = {};
      
      // Convert from our form data format to Parameter format
      Object.entries(parsed).forEach(([id, item]: [string, unknown]) => {
        if (item && typeof item === 'object' && (item as { key?: string }).key !== undefined) {
          result[id] = {
            id,
            name: (item as { key?: string }).key || "",
            value: (item as { value?: string }).value || "",
            isDisabled: (item as { isDisabled?: boolean }).isDisabled || false,
          };
        }
      });
      
      return result;
    } catch {
      return {};
    }
  }, [value]);

  // Convert Parameter format back to JSON string
  const handleParametersChange = (newParameters: Record<string, Parameter>) => {
    const formData: Record<string, unknown> = {};
    
    Object.entries(newParameters).forEach(([id, param]) => {
      formData[id] = {
        id,
        key: param.name,
        value: param.value,
        type: "text", // Default to text for now
        isDisabled: param.isDisabled || false,
      };
    });
    
    onChange(JSON.stringify(formData));
  };

  return (
    <div className={styles.formDataEditor}>
      <ListPropertyEditor
        type="form-data"
        title={title}
        value={parameters}
        onChange={handleParametersChange}
        allowSelection={true}
      />
    </div>
  );
} 