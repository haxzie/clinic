import React, { useState, ReactNode, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./Tooltip.module.scss";

type TooltipPosition = "top" | "right" | "bottom" | "left";

interface TooltipProps {
  text?: string;
  position?: TooltipPosition;
  delay?: number; // Time in milliseconds
  style?: React.CSSProperties;
  children: ReactNode;
}

const Tooltip = ({
  text,
  position = "top",
  delay = 500,
  style = {},
  children,
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [tooltipCoords, setTooltipCoords] = useState({ top: 0, left: 0 });
  const childRef = useRef<HTMLDivElement>(null);

  // Get position-specific class name
  const getPositionClassName = (): string => {
    switch (position) {
      case "top":
        return styles.top;
      case "bottom":
        return styles.bottom;
      case "left":
        return styles.left;
      case "right":
        return styles.right;
      default:
        return styles.top;
    }
  };

  const handleShowTooltip = (): void => {
    if (timeoutId) clearTimeout(timeoutId);

    updateTooltipPosition();

    if (delay === 0) {
      setIsVisible(true);
      return;
    }

    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const handleHideTooltip = (): void => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
    setTimeoutId(null);
    return;
  };

  const updateTooltipPosition = () => {
    if (!childRef.current) return;

    const rect = childRef.current.getBoundingClientRect();
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Base position (center of the element)
    const baseLeft = rect.left + scrollLeft;
    const baseTop = rect.top + scrollTop;

    let top = 0;
    let left = 0;

    // Calculate position based on the chosen direction
    switch (position) {
      case "top":
        top = baseTop - 10; // Add some distance from the element
        left = baseLeft + rect.width / 2;
        break;
      case "bottom":
        top = baseTop + rect.height + 10;
        left = baseLeft + rect.width / 2;
        break;
      case "left":
        top = baseTop + rect.height / 2;
        left = baseLeft - 10;
        break;
      case "right":
        top = baseTop + rect.height / 2;
        left = baseLeft + rect.width + 10;
        break;
      default:
        top = baseTop - 10;
        left = baseLeft + rect.width / 2;
    }

    setTooltipCoords({ top, left });
  };

  // Update position when window resizes
  useEffect(() => {
    if (isVisible) {
      const handleResize = () => {
        updateTooltipPosition();
      };

      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [isVisible, updateTooltipPosition]);

  // Clean up timeout when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  return (
    <div
      className={styles.tooltipContainer}
      onMouseEnter={handleShowTooltip}
      onMouseLeave={handleHideTooltip}
      onFocus={handleShowTooltip}
      onBlur={handleHideTooltip}
      ref={childRef}
      style={style}
    >
      {children}

      {text &&
        isVisible &&
        createPortal(
          <div
            className={`${styles.tooltip} ${getPositionClassName()}`}
            style={{
              position: "absolute",
              top: `${tooltipCoords.top}px`,
              left: `${tooltipCoords.left}px`,
            }}
            role="tooltip"
          >
            {text}
          </div>,
          document.body
        )}
    </div>
  );
};

export default Tooltip;
