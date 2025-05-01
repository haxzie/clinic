import React, { useMemo, useState } from "react";
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
          <div className={`${styles.options}`}>
            {displayOptions.map((option) => (
              <div
                key={option.id}
                className={styles.option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                {optionElement
                  ? React.createElement(optionElement, { value: option.value })
                  : option.value}
              </div>
            ))}
          </div>
        </DropDownPortal>
      )}
    </>
  );
}
