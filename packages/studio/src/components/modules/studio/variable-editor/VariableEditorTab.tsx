import React, { useCallback, useMemo } from "react";
import ListPropertyEditor, { Parameter } from "../api-editor/request-builder/request-properties/shared/list-property-editor/ListPropertyEditor";
import { EnvironmentVariable } from "@/store/api-store/api.types";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";

interface VariableEditorTabProps {
  selectedEnvironmentId: string;
}

export default function VariableEditorTab({ selectedEnvironmentId }: VariableEditorTabProps) {
  const { environments, updateEnvironment } = useApiStore(
    useShallow(({ environments, updateEnvironment }) => ({
      environments,
      updateEnvironment,
    }))
  );

  const selectedEnvironment = environments[selectedEnvironmentId];

  // Convert environment variables to Parameter format for ListPropertyEditor
  // For non-default environments, merge with default values as placeholders
  const variablesAsParams: Record<string, Parameter> = useMemo(() => {
    if (!selectedEnvironment) return {};
    
    const result: Record<string, Parameter> = {};
    const defaultEnv = environments["default"];
    
    // If not default environment, show default values as placeholders
    if (!selectedEnvironment.isDefault && defaultEnv) {
      // First, add all default variables as placeholders with readonly keys
      Object.keys(defaultEnv.data.variables).forEach((key) => {
        const defaultVar = defaultEnv.data.variables[key];
        result[key] = {
          id: defaultVar.id,
          name: defaultVar.name,
          value: "",
          placeholder: defaultVar.value,
          isKeyReadOnly: true, // Key cannot be edited, inherited from default
        };
      });
    }
    
    // Then overlay current environment's variables
    Object.keys(selectedEnvironment.data.variables).forEach((key) => {
      const variable = selectedEnvironment.data.variables[key];
      result[key] = {
        id: variable.id,
        name: variable.name,
        value: variable.value,
        placeholder: result[key]?.placeholder,
        isKeyReadOnly: result[key]?.isKeyReadOnly, // Preserve readonly status if inherited
        isDisabled: variable.isDisabled,
      };
    });
    
    return result;
  }, [selectedEnvironment, environments]);

  const handleUpdateVariables = useCallback(
    (values: Record<string, Parameter>) => {
      const variables: Record<string, EnvironmentVariable> = {};
      Object.keys(values).forEach((key) => {
        const param = values[key];
        variables[key] = {
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
          variables,
        },
      });
    },
    [selectedEnvironmentId, selectedEnvironment, updateEnvironment]
  );

  return (
    <ListPropertyEditor
      title="Variable"
      type="Variable"
      value={variablesAsParams}
      onChange={handleUpdateVariables}
      disableRemoveItem={selectedEnvironment?.isDefault ? false : undefined}
    />
  );
}

