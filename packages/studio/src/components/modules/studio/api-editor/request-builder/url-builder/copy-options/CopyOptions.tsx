import React from "react";
import Button from "@/components/base/button/Button";
import CopyIcon from "@/components/icons/CopyIcon";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import { DropDown } from "@/components/base/dropdown/DropDown";
import useApiStore from "@/store/api-store/api.store";
import { createCurlCommand, createFetchCommand } from "@/utils/requestUtils";
import CheckIcon from "@/components/icons/CheckIcon";
import { Events, track } from "@/lib/analytics";
import { replaceVariables } from "@/utils/variableReplacer";
import { EnvironmentData } from "@/store/api-store/api.types";

export default function CopyOptions({ apiId }: { apiId: string }) {
  const [copied, setCopied] = React.useState(false);
  const selectOptions = [
    {
      id: "copy-url",
      value: "Copy URL",
    },
    {
      id: "copy-curl",
      value: "Copy cURL",
    },
    {
      id: "copy-fetch",
      value: "Copy Fetch",
    },
  ];

  const handleOnChange = (option: { id: string; value: string }) => {
    const store = useApiStore.getState();
    const api = store.apis[apiId];
    if (!api) {
      return;
    }

    switch (option.id) {
      case "copy-url": {
        // Get environment data and process variables
        const activeEnvironment = store.getActiveEnvironment();
        const defaultEnvironment = store.environments["default"];
        
        // Merge environment variables
        const mergedVariables: Record<string, { id: string; name: string; value: string }> = {};
        
        if (defaultEnvironment) {
          Object.entries(defaultEnvironment.data.variables).forEach(([key, variable]) => {
            if (variable.value) {
              mergedVariables[key] = variable;
            }
          });
        }
        
        if (activeEnvironment) {
          Object.entries(activeEnvironment.data.variables).forEach(([key, variable]) => {
            if (variable.value) {
              mergedVariables[key] = variable;
            }
          });
        }

        const environmentData: EnvironmentData = {
          variables: mergedVariables,
          headers: {},
        };

        // Remove query params from the url first
        const urlWithoutQueryParams = api.url.split("?")[0];
        
        // Process URL with variables
        let processedUrl = replaceVariables(urlWithoutQueryParams, environmentData);
        
        // Add query parameters with variables processed
        const activeParams = Object.values(api.parameters).filter(param => !param.isDisabled);
        if (activeParams.length > 0) {
          const processedParams = activeParams.map(param => {
            const processedKey = replaceVariables(param.name, environmentData);
            const processedValue = replaceVariables(param.value, environmentData);
            return `${encodeURIComponent(processedKey)}=${encodeURIComponent(processedValue)}`;
          });
          processedUrl += `?${processedParams.join('&')}`;
        }

        // Copy URL with processed variables to clipboard
        navigator.clipboard.writeText(processedUrl);
        break;
      }
      case "copy-curl": {
        // Copy cURL command to clipboard
        navigator.clipboard.writeText(createCurlCommand(api));
        
        // Track API_CURL_COPIED event
        track(Events.API_CURL_COPIED, {});
        break;
      }
      case "copy-fetch": {
        navigator.clipboard.writeText(createFetchCommand(api));
        
        // Track API_FETCH_COPIED event
        track(Events.API_FETCH_COPIED, {});
        break;
      }
      default:
        break;
    }

    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  const SelectElement = () => (
    <Button size="small" variant="secondary">
      {copied ? <CheckIcon size={16} color="var(--color-success)" /> : <CopyIcon size={16} />}
      <ChevronDownIcon size={16} />
    </Button>
  );

  return (
    <DropDown
      showChevron={false}
      options={selectOptions}
      selectElement={SelectElement}
      onChange={handleOnChange}
    />
  );
}
