import React, { useMemo } from "react";
import styles from "./NProgress.module.scss";

interface NProgressProps {
  active?: boolean;
  duration?: number; // Duration in milliseconds
}

export default function NProgress({ active, duration = 0 }: NProgressProps) {
  // Determine speed state based on duration
  const speedState = useMemo(() => {
    if (!duration || duration < 500) {
      return "fast"; // < 500ms -> green
    } else if (duration < 1000) {
      return "medium"; // < 1s -> orange
    } else {
      return "slow"; // >= 1s -> red
    }
  }, [duration]);

  return (
    <div
      className={[
        styles.nprogress,
        active ? styles.active : "",
        styles[speedState],
      ].join(" ")}
    ></div>
  );
}
