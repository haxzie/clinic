import React, { useMemo } from "react";
import ListPropertyEditor, {
  Parameter,
} from "../shared/list-property-editor/ListPropertyEditor";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";
import { generateUUID } from "@/utils/dataUtils";
import { prepareAuthorizationHeaders } from "@/utils/auth";
import { useEnvironmentEditor } from "../../../../variable-editor/EnvironmentEditor";
import { Tabs } from "../RequestProperties";

export default function HeadersEditor({ apiId, onTabChange }: { apiId: string; onTabChange?: (tab: Tabs) => void }) {
  const environmentEditor = useEnvironmentEditor();
  const { headers, authorization, activeEnvironment, setHeaders } = useApiStore(
    useShallow((state) => ({
      headers: state.apis[apiId].headers,
      authorization: state.apis[apiId].authorization,
      activeEnvironment: state.getActiveEnvironment(),
      setHeaders: state.setHeaders,
    }))
  );

  // Prepare authorization headers as read-only entries
  const authHeaders = useMemo(() => {
    const authHeadersObj = prepareAuthorizationHeaders(authorization);
    const authHeaderEntries: Record<string, Parameter> = {};

    Object.entries(authHeadersObj).forEach(([key, value]) => {
      const id = generateUUID("auth-header");
      authHeaderEntries[id] = {
        id,
        name: key,
        value,
        isReadOnly: true,
        placeholder: `Auto-generated from ${authorization?.type || "NONE"} authorization`,
        source: "auth",
      };
    });

    return authHeaderEntries;
  }, [authorization]);

  // Prepare environment headers as placeholder entries
  const envHeaders = useMemo(() => {
    const { environments } = useApiStore.getState();
    const defaultEnv = environments["default"];
    
    if (!defaultEnv) return {};
    
    const envHeaderEntries: Record<string, Parameter> = {};
    
    // First, add all default environment headers as base (placeholders)
    Object.values(defaultEnv.data.headers).forEach((defaultHeader) => {
      const id = `env-header-${defaultHeader.id}`;
      envHeaderEntries[id] = {
        id,
        name: defaultHeader.name,
        value: "",
        placeholder: defaultHeader.value,
        isKeyReadOnly: true, // Key cannot be edited, from environment
        source: "environment",
      };
    });
    
    // Then, if we're in a non-default environment, overlay its overrides
    if (activeEnvironment && !activeEnvironment.isDefault) {
      Object.values(activeEnvironment.data.headers).forEach((envHeader) => {
        const id = `env-header-${envHeader.id}`;
        if (envHeaderEntries[id]) {
          // Override the default value with environment-specific value
          envHeaderEntries[id] = {
            ...envHeaderEntries[id],
            value: envHeader.value,
            source: "environment",
          };
        } else {
          // This is a custom header in this environment (not in default)
          envHeaderEntries[id] = {
            id,
            name: envHeader.name,
            value: envHeader.value,
            placeholder: "",
            isKeyReadOnly: true,
            source: "environment",
          };
        }
      });
    } else if (activeEnvironment && activeEnvironment.isDefault) {
      // For default environment, show actual values instead of placeholders
      Object.values(activeEnvironment.data.headers).forEach((envHeader) => {
        const id = `env-header-${envHeader.id}`;
        envHeaderEntries[id] = {
          id,
          name: envHeader.name,
          value: envHeader.value,
          placeholder: "",
          isKeyReadOnly: true,
          source: "environment",
        };
      });
    }

    return envHeaderEntries;
  }, [activeEnvironment]);

  // Combine auth headers, environment headers, and regular headers
  const combinedHeaders = useMemo(() => {
    // First add auth headers
    const combined = { ...authHeaders };
    
    // Then add environment headers
    Object.entries(envHeaders).forEach(([id, header]) => {
      combined[id] = header;
    });
    
    // Finally add user headers (these override everything)
    Object.entries(headers).forEach(([id, header]) => {
      // Check if this is overriding an env header
      const envHeaderId = `env-header-${id}`;
      if (combined[envHeaderId]) {
        // This is an override of an env header - update value and disabled state
        combined[envHeaderId] = {
          ...combined[envHeaderId],
          value: header.value,
          isDisabled: header.isDisabled,
        };
      } else {
        // This is a new custom header
        combined[id] = header;
      }
    });

    return combined;
  }, [envHeaders, authHeaders, headers]);

  // handle update headers
  const handleOnChangeHeaders = (updatedHeaders: Record<string, Parameter>) => {
    // Filter out read-only auth headers and empty environment headers before saving
    const editableHeaders: Record<string, Parameter> = {};
    Object.entries(updatedHeaders).forEach(([id, header]) => {
      // Skip auth headers (read-only)
      if (header.isReadOnly) {
        return;
      }
      
      // For environment headers, save if they have a value override OR if they're disabled
      if (id.startsWith("env-header-")) {
        const hasValue = header.value && header.value.trim() !== "";
        const isDisabled = header.isDisabled === true;
        
        if (hasValue || isDisabled) {
          // Extract the original ID
          const originalId = id.replace("env-header-", "");
          editableHeaders[originalId] = {
            ...header,
            id: originalId,
          };
        }
        // If neither has value nor is disabled, don't save (uses env default)
      } else {
        // Regular custom header
        editableHeaders[id] = header;
      }
    });
    setHeaders(apiId, editableHeaders);
  };

  const handleIconClick = (itemId: string) => {
    const header = combinedHeaders[itemId];
    
    if (header?.source === "environment") {
      environmentEditor.open({ tab: "headers" });
    } else if (header?.source === "auth" && onTabChange) {
      onTabChange(Tabs.auth);
    }
  };

  return (
    <ListPropertyEditor
      type="headers"
      title="Header"
      value={combinedHeaders}
      onChange={handleOnChangeHeaders}
      allowSelection={true}
      onIconClick={handleIconClick}
    />
  );
}
