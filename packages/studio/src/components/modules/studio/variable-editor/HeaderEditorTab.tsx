import React, { useCallback, useMemo } from "react";
import ListPropertyEditor, { Parameter } from "../api-editor/request-builder/request-properties/shared/list-property-editor/ListPropertyEditor";
import { EnvironmentVariable } from "@/store/api-store/api.types";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";

interface HeaderEditorTabProps {
  selectedEnvironmentId: string;
}

export default function HeaderEditorTab({ selectedEnvironmentId }: HeaderEditorTabProps) {
  const { environments, updateEnvironment } = useApiStore(
    useShallow(({ environments, updateEnvironment }) => ({
      environments,
      updateEnvironment,
    }))
  );

  const selectedEnvironment = environments[selectedEnvironmentId];

  const headersAsParams: Record<string, Parameter> = useMemo(() => {
    if (!selectedEnvironment) return {};
    
    const result: Record<string, Parameter> = {};
    const defaultEnv = environments["default"];
    
    // If not default environment, show default values as placeholders
    if (!selectedEnvironment.isDefault && defaultEnv) {
      // First, add all default headers as placeholders with readonly keys
      Object.keys(defaultEnv.data.headers).forEach((key) => {
        const defaultHeader = defaultEnv.data.headers[key];
        result[key] = {
          id: defaultHeader.id,
          name: defaultHeader.name,
          value: "",
          placeholder: defaultHeader.value,
          isKeyReadOnly: true, // Key cannot be edited, inherited from default
        };
      });
    }
    
    // Then overlay current environment's headers
    Object.keys(selectedEnvironment.data.headers).forEach((key) => {
      const header = selectedEnvironment.data.headers[key];
      result[key] = {
        id: header.id,
        name: header.name,
        value: header.value,
        placeholder: result[key]?.placeholder,
        isKeyReadOnly: result[key]?.isKeyReadOnly, // Preserve readonly status if inherited
        isDisabled: header.isDisabled,
      };
    });
    
    return result;
  }, [selectedEnvironment, environments]);

  const handleUpdateHeaders = useCallback(
    (values: Record<string, Parameter>) => {
      const headers: Record<string, EnvironmentVariable> = {};
      Object.keys(values).forEach((key) => {
        const param = values[key];
        headers[key] = {
          id: param.id,
          name: param.name,
          value: param.value,
          isReadOnly: param.isReadOnly,
          isDisabled: param.isDisabled,
        };
      });

      updateEnvironment(selectedEnvironmentId, {
        data: {
          ...selectedEnvironment.data,
          headers,
        },
      });
    },
    [selectedEnvironmentId, selectedEnvironment, updateEnvironment]
  );

  return (
    <ListPropertyEditor
      title="Header"
      type="Header"
      value={headersAsParams}
      onChange={handleUpdateHeaders}
      disableRemoveItem={selectedEnvironment?.isDefault ? false : undefined}
    />
  );
}

