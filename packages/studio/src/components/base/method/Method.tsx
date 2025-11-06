import React from "react";
import styles from "./Method.module.scss";
import { RequestMethod } from "@apiclinic/core";
import RequestIcon, { Requests } from "@/components/icons/RequestIcon";

export default function Method({
  value,
  style,
}: {
  value: RequestMethod;
  style?: React.CSSProperties;
}) {
  return (
    <span className={[styles.method, styles[value]].join(" ")} style={{
      color: Requests[value].color,
      ...style,
    }}>
      <RequestIcon method={value} size={16}/>
      {value}
    </span>
  );
}
