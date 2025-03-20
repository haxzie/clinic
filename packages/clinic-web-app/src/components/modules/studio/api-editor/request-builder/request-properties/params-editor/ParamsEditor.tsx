import React from "react";
import styles from "./ParamsEditor.module.scss";
import ListPropertyEditor from "../shared/list-property-editor/ListPropertyEditor";
import { useAPI } from "../../../api-context-provider/APIContextProvider";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";

export default function ParamsEditor() {
  const { apiId, setParameters } = useAPI();
  const { parameters } = useApiStore(
    useShallow((state) => ({ parameters: state.apis[apiId].parameters }))
  );

  return (
    <div className={styles.paramsEditor}>
      <ListPropertyEditor
        type="params"
        title="Params"
        value={parameters}
        onChange={setParameters}
      />
    </div>
  );
}
