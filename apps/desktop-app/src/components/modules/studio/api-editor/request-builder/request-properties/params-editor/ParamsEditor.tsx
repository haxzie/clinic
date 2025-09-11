import React, { useCallback } from "react";
import styles from "./ParamsEditor.module.scss";
import ListPropertyEditor from "../shared/list-property-editor/ListPropertyEditor";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";
import { RequestParameters } from "@/types/API.types";

/**
 * Convert RequestParameters to URL query string and append to base URL
 */
const updateUrlWithParameters = (baseUrl: string, parameters: RequestParameters): string => {
  // Remove existing query parameters from the base URL
  const urlWithoutQuery = baseUrl.split('?')[0];
  
  // Convert parameters object to query string
  const queryParams: string[] = [];
  Object.values(parameters).forEach(param => {
    if (param.name && param.value) {
      queryParams.push(`${encodeURIComponent(param.name)}=${encodeURIComponent(param.value)}`);
    }
  });
  
  // Combine base URL with query parameters
  if (queryParams.length > 0) {
    return `${urlWithoutQuery}?${queryParams.join('&')}`;
  }
  
  return urlWithoutQuery;
};

export default function ParamsEditor({ apiId }: { apiId: string }) {
  const { parameters, url, setParameters, setUrl } = useApiStore(
    useShallow((state) => ({
      parameters: state.apis[apiId].parameters,
      url: state.apis[apiId].url,
      setParameters: state.setParameters,
      setUrl: state.setUrl,
    }))
  );

  const handleParametersChange = useCallback(
    (parameters: RequestParameters) => {
      setParameters(apiId, parameters);
      
      // Update URL to include the new parameters
      const updatedUrl = updateUrlWithParameters(url, parameters);
      setUrl(apiId, updatedUrl);
    },
    [setParameters, setUrl, apiId, url]
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
