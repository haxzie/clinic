import React from "react";
import APIPendingIcon from "@/components/icons/APIPendingIcon";
import APISuccessIcon from "@/components/icons/APISuccessIcon";
import APIFailedIcon from "@/components/icons/APIFailedIcon";

export default function APIStatusIcon({ status }: { status?: number}) {
  const statusIcon: Record<string, React.ComponentType<{ size: number }>> = {
    pending: APIPendingIcon,
    success: APISuccessIcon,
    error: APIFailedIcon,
  };

  const StatusIcon = !status
    ? statusIcon["pending"]
    : status >= 400
      ? statusIcon["error"]
      : statusIcon["success"];

  return <StatusIcon size={16} />;
}
