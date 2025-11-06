import React, { useEffect, useMemo, useState } from "react";
import styles from "./DropDown.module.scss";
import Portal from "@/components/shared/portal/Portal";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import { AnimatePresence, motion } from "motion/react";

export type DropDownProps<T extends { id: string; value: string }> = {
  value?: T;
  onChange: (value: T) => void;
  options: Array<T> | Record<string, T>;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  showChevron?: boolean;
  selectElement?: React.ComponentType<{ value: T["value"] }>;
  optionElement?: React.ComponentType<{ value: T["value"] }>;
};

/**
 * Portal to render the dropdown as a whole
 * @param param0.children
 */
export function DropDownPortal({
  children,
  parentRef,
  onClickOutside,
}: {
  children: React.ReactNode;
  parentRef: React.RefObject<HTMLElement | null>;
  onClickOutside: () => void;
}) {
  // Create a portal just below the position of parent ref
  const parentRect = parentRef?.current?.getBoundingClientRect();
  const portalStyle: React.CSSProperties = {
    position: "absolute",
    top: parentRect ? parentRect.bottom + 2 : 2,
    left: parentRect ? parentRect.left : 0,
    minWidth: parentRect ? parentRect.width : "auto",
    height: "auto",
    maxHeight: window.innerHeight - (parentRect ? parentRect.bottom : 0) - 20,
    maxWidth: window.innerWidth - (parentRect ? parentRect.left : 0) - 20,
    zIndex: 1000,
  };

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.target as HTMLElement;
    if (parentRef.current && !parentRef.current.contains(target)) {
      // Close the dropdown if clicked outside
      parentRef.current.click();
      if (onClickOutside) {
        onClickOutside();
      }
    }
  };

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        if (onClickOutside) {
          onClickOutside();
        }
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [onClickOutside]);

  return (
    <Portal>
      <div className={styles.portalBackground} onClick={handleClickOutside}>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            key="dropdown-portal"
            className={styles.optionsWrapper}
            style={portalStyle}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </Portal>
  );
}

function DropDownOptions<T extends { id: string; value: string }>({
  options,
  optionElement,
  onChange,
}: {
  options: Array<T>;
  optionElement?: React.ComponentType<{ value: T["value"] }>;
  onChange: (option: T) => void;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const optionRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  const backgroundStyle: React.CSSProperties = useMemo(() => {
    if (hoveredIndex === null || !optionRefs.current[hoveredIndex]) {
      return { opacity: 0 };
    }

    const hoveredElement = optionRefs.current[hoveredIndex];
    if (!hoveredElement) return { opacity: 0 };

    const firstElement = optionRefs.current[0];
    if (!firstElement) return { opacity: 0 };

    const offsetTop = hoveredElement.offsetTop - firstElement.offsetTop;

    return {
      opacity: 1,
      transform: `translateY(${offsetTop}px)`,
      height: `${hoveredElement.offsetHeight}px`,
    };
  }, [hoveredIndex]);

  return (
    <div className={styles.options}>
      <div className={styles.hoverBackground} style={backgroundStyle} />
      {options.map((option, index) => (
        <div
          key={option.id}
          ref={(el) => {
            optionRefs.current[index] = el;
          }}
          className={styles.option}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => onChange(option)}
        >
          {optionElement
            ? React.createElement(optionElement, { value: option.value })
            : option.value}
        </div>
      ))}
    </div>
  );
}

export function DropDown<T extends { id: string; value: string }>({
  value,
  onChange,
  options,
  className,
  selectElement,
  optionElement,
  showChevron = true,
}: DropDownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const parentRef = React.useRef<HTMLDivElement>(null);

  const displayOptions: Array<T> = useMemo(() => {
    if (Array.isArray(options)) {
      return options;
    } else {
      return Object.values(options);
    }
  }, [options]);

  return (
    <>
      <div
        ref={parentRef}
        className={[styles.select, className].join(" ")}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectElement ? (
          React.createElement(selectElement, {
            value: value?.value as T["value"],
          })
        ) : (
          <span className={styles.selectValue}>
            {value?.value || "Select an option"}
          </span>
        )}
        {showChevron && (
          <div className={[styles.chevron, isOpen && styles.open].join(` `)}>
            <ChevronDownIcon size={18} />
          </div>
        )}
      </div>

      {isOpen && (
        <DropDownPortal
          parentRef={parentRef}
          onClickOutside={() => setIsOpen(false)}
        >
          <DropDownOptions
            options={displayOptions}
            optionElement={optionElement}
            onChange={(option) => {
              onChange(option);
              setIsOpen(false);
            }}
          />
        </DropDownPortal>
      )}
    </>
  );
}
