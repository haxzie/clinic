import React from "react";
import styles from "./HeadersEditor.module.scss";
import ListPropertyEditor from "../shared/list-property-editor/ListPropertyEditor";
import { useAPI } from "../../../api-context-provider/APIContextProvider";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";

export default function HeadersEditor() {
  const { apiId, setHeaders } = useAPI();
  const { headers } = useApiStore(
    useShallow((state) => ({ headers: state.apis[apiId].headers }))
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
