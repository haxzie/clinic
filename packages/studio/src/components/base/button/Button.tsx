import React from "react";
import styles from "./Button.module.scss";
import LoadingDots from "@/components/shared/loading-dots/LoadingDots";

export default function Button({
  size = "medium",
  variant = "primary",
  type = "submit",
  onClick,
  children,
  disabled,
  loading,
}: Readonly<{
  size?: "small" | "medium" | "large";
  variant?: "primary" | "secondary" | "tertiary";
  type?: "submit" | "button";
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}>) {
  return (
    <button
      type={type}
      className={[
        styles.button,
        styles[variant],
        loading && styles.loading,
        disabled && styles.disabled,
        styles[size],
      ].join(" ")}
      onClick={onClick && onClick}
      disabled={disabled}
    >
      <div className={styles.content}>{children}</div>
      <div className={styles.loader}>{loading && <LoadingDots />}</div>
    </button>
  );
}
