import React from "react";
import Button from "@/components/base/button/Button";
import CopyIcon from "@/components/icons/CopyIcon";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import { DropDown } from "@/components/base/dropdown/DropDown";
import useApiStore from "@/store/api-store/api.store";
import { createCurlCommand, createFetchCommand } from "@/utils/requestUtils";

export default function CopyOptions({ apiId }: { apiId: string }) {
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
    const api = useApiStore.getState().apis[apiId];
    if (!api) {
      return;
    }
    const { path } = api;
    
    switch (option.id) {
      case "copy-url":
        // Copy URL to clipboard
        navigator.clipboard.writeText(path);
        break;
      case "copy-curl": {
        // Copy cURL command to clipboard
        navigator.clipboard.writeText(createCurlCommand(api));
        break;
      }
      case "copy-fetch": {
        navigator.clipboard.writeText(createFetchCommand(api));
        break;
      }
      default:
        break;
    }
  };

  const SelectElement = () => (
    <Button size="small" variant="secondary">
      <CopyIcon size={16} />
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
