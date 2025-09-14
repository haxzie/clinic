import React, {useEffect} from "react";
import styles from "./Modal.module.scss";
import Portal from "@/components/shared/portal/Portal";

export default function Modal({
  children,
  onClickOutside,
}: {
  children: React.ReactNode;
  onClickOutside: () => void;
}) {
  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      onClickOutside();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClickOutside();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClickOutside]);



  return (
    <Portal>
      <div className={styles.modalBackground} onClick={handleClickOutside}>
        {children}
      </div>
    </Portal>
  );
}
