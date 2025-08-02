import React, { useMemo } from "react";
import styles from "./HeadersEditor.module.scss";
import ListPropertyEditor, { Parameter } from "../shared/list-property-editor/ListPropertyEditor";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";
import { generateUUID } from "@/utils/dataUtils";
import { prepareAuthorizationHeaders } from "@/utils/auth";

export default function HeadersEditor({ apiId }: { apiId: string }) {
  const { headers, authorization, setHeaders } = useApiStore(
    useShallow((state) => ({
      headers: state.apis[apiId].headers,
      authorization: state.apis[apiId].authorization,
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
      };
    });

    return authHeaderEntries;
  }, [authorization, prepareAuthorizationHeaders]);

  // Combine regular headers with auth headers
  const combinedHeaders = useMemo(() => {
    return {
      ...authHeaders,
      ...headers,
    };
  }, [authHeaders, headers]);

  // handle update headers
  const handleOnChangeHeaders = (updatedHeaders: Record<string, Parameter>) => {
    // Filter out read-only auth headers before saving
    const editableHeaders: Record<string, Parameter> = {};
    Object.entries(updatedHeaders).forEach(([id, header]) => {
      if (!header.isReadOnly) {
        editableHeaders[id] = header;
      }
    });
    setHeaders(apiId, editableHeaders);
  };

  return (
    <div className={styles.headersEditor}>
      <ListPropertyEditor
        type="headers"
        title="Header"
        value={combinedHeaders}
        onChange={handleOnChangeHeaders}
        allowSelection={true}
      />
    </div>
  );
}
