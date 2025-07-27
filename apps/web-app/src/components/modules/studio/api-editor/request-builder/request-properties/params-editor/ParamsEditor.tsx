import React, { useCallback } from "react";
import styles from "./ParamsEditor.module.scss";
import ListPropertyEditor from "../shared/list-property-editor/ListPropertyEditor";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";
import { RequestParameters } from "@/types/API.types";

export default function ParamsEditor({ apiId }: { apiId: string }) {
  const { parameters, setParameters } = useApiStore(
    useShallow((state) => ({
      parameters: state.apis[apiId].parameters,
      setParameters: state.setParameters,
    }))
  );

  const handleParametersChange = useCallback(
    (parameters: RequestParameters) => {
      setParameters(apiId, parameters);
    },
    [setParameters]
  );

  return (
    <div className={styles.paramsEditor}>
      <ListPropertyEditor
        type="params"
        title="Params"
        value={parameters}
        onChange={handleParametersChange}
        allowSelection={true}
      />
    </div>
  );
}
