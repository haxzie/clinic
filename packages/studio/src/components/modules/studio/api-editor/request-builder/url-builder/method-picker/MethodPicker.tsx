import React, { useMemo } from "react";
import styles from "./MethodPicker.module.scss";
import { RequestMethod, RequestMethods } from "@apiclinic/core";
import { DropDown } from "@/components/base/dropdown/DropDown";
import Method from "@/components/base/method/Method";

export default function MethodPicker({
  value,
  onChange,
}: {
  value: RequestMethod;
  onChange: (method: RequestMethod) => void;
}) {
  const selectedValue = useMemo(() => {
    return { id: value, value: RequestMethods[value as RequestMethod] };
  }, [value]);
  const options = Object.keys(RequestMethods).map((method) => {
    return {
      id: method,
      value: RequestMethods[method as RequestMethod],
    };
  });

  return (
    <DropDown
      options={options}
      value={selectedValue}
      onChange={(value) => onChange(value.id as RequestMethod)}
      className={styles.methodPicker}
      selectElement={Method}
      optionElement={Method}
    />
  );
}
