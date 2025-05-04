import React from "react";
import styles from "./ParamsEditor.module.scss";
import ListPropertyEditor from "../shared/list-property-editor/ListPropertyEditor";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";

export default function ParamsEditor() {
  const { parameters, setParameters } = useApiStore(
    useShallow((state) => ({
      parameters: state.apis[state.activeAPI].parameters,
      setParameters: state.setParameters,
    }))
  );

  return (
    <div className={styles.paramsEditor}>
      <ListPropertyEditor
        type="params"
        title="Params"
        value={parameters}
        onChange={setParameters}
        allowSelection={true}
      />
    </div>
  );
}
