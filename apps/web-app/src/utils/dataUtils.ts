import { v4 as uuid } from "uuid";

export const generateUUID = (prefix?: string) => {
  return `${prefix ? `${prefix}-` : ""}${uuid()}`;
};

export const mapArray = <T extends { id: string }>(
  data: Array<T>
): Record<string, T> => {
  return data.reduce((acc: Record<string, T>, item) => {
    acc[item.id] = item;
    return acc;
  }, {});
};

export const formatTime = (time: number) => {
  if (time < 1000) {
    return `${time.toFixed(2)}ms`;
  } else if (time < 10000) {
    return `${(time / 1000).toFixed(2)}s`;
  } else {
    return `${(time / 1000).toFixed(2)}s`;
  }
};

/**
 * Formats a byte size into a human-readable string (B, KB, MB, GB)
 * @param bytes The size in bytes
 * @param decimals Number of decimal places to show
 * @returns Formatted string with appropriate unit
 */
export const formatByteSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  // Determine appropriate unit (Bytes, KB, MB, etc.)
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Format with proper unit and decimal places
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
  );
}
