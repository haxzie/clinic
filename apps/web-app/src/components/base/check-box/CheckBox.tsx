import React from "react";
import styles from "./CheckBox.module.scss";
import IconButton from "../icon-button/IconButton";
import CheckBoxIcon from "@/components/icons/CheckBoxIcon";
import CheckBoxUncheckedIcon from "@/components/icons/CheckBoxUncheckedIcon";

export default function CheckBox({
  value,
  onChange,
  disabled = false,
}: {
  value: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <IconButton
      size="small"  
      onClick={() => onChange && onChange(!value)}
      disabled={disabled}
      className={[styles.checkBox, value && styles.selected].join(" ")}
    >
      {!!value ? <CheckBoxIcon size={18} /> : <CheckBoxUncheckedIcon size={18} />}
    </IconButton>
  );
}
