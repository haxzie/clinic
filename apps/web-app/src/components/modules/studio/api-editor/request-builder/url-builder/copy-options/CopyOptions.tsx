import React from "react";
import Button from "@/components/base/button/Button";
import CopyIcon from "@/components/icons/CopyIcon";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import { DropDown } from "@/components/base/dropdown/DropDown";
import useApiStore from "@/store/api-store/api.store";
import { createCurlCommand, createFetchCommand } from "@/utils/requestUtils";
import CheckIcon from "@/components/icons/CheckIcon";

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
    const api = useApiStore.getState().apis[apiId];
    if (!api) {
      return;
    }
    const { url } = api;

    switch (option.id) {
      case "copy-url":
        // Copy URL to clipboard
        navigator.clipboard.writeText(url);
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
