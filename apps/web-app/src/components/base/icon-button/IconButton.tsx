import React, { MouseEvent } from "react";
import styles from "./IconButton.module.scss";
import CheckIcon from "@/components/icons/CheckIcon";
import Tooltip from "../tooltip/Tooltip";

export default function IconButton({
  size = "small",
  onClick,
  children,
  showSuccess,
  color,
  className = "",
  tooltip,
  tooltipPosition = "top",
  disabled = false,
}: Readonly<{
  size?: "small" | "medium" | "large";
  children: React.ReactNode;
  color?: string;
  className?: string;
  onClick?: () => void;
  showSuccess?: boolean;
  tooltip?: string;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
  disabled?: boolean;
}>) {
  const [clicked, setClicked] = React.useState(false);

  const handleClick = (e: MouseEvent) => {
    if (onClick) {
      e.stopPropagation();
      e.preventDefault();

      onClick();

      if (showSuccess) {
        setClicked(true);
        setTimeout(() => {
          setClicked(false);
        }, 1000);
      }
    }
  };
  return (
    <Tooltip text={tooltip} position={tooltipPosition}>
      <button
        className={[
          styles.iconButton,
          clicked && styles.clicked,
          styles[size],
          disabled && styles.disabled,  
          className,
        ].join(" ")}
        onClick={handleClick}
        tabIndex={-1}
        type="button"
        disabled={disabled}
      >
        <div
          className={styles.content}
          style={{
            color: color,
          }}
        >
          {children}
        </div>
        {clicked && (
          <div className={styles.success}>
            <CheckIcon size={24} />
          </div>
        )}
      </button>
    </Tooltip>
  );
}
