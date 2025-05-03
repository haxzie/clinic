import React from "react";
import styles from "./HeadersEditor.module.scss";
import ListPropertyEditor from "../shared/list-property-editor/ListPropertyEditor";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";

export default function HeadersEditor() {
  const { headers, setHeaders } = useApiStore(
    useShallow((state) => ({
      headers: state.apis[state.activeAPI].headers,
      setHeaders: state.setHeaders,
    }))
  );

  return (
    <div className={styles.headersEditor}>
      <ListPropertyEditor
        type="headers"
        title="Header"
        value={headers}
        onChange={setHeaders}
      />
    </div>
  );
}
