import React from "react";
import styles from "./Method.module.scss";
import { RequestMethod } from "@apiclinic/core";

export default function Method({
  value,
  style,
}: {
  value: RequestMethod;
  style?: React.CSSProperties;
}) {
  return (
    <span className={[styles.method, styles[value]].join(" ")} style={style}>
      {value}
    </span>
  );
}
