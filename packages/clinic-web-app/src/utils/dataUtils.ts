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
