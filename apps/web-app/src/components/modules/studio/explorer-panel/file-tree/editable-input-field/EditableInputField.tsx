import React, { useState, useRef, useEffect, useCallback } from "react";
import styles from "./EditableInputField.module.scss";

export default function EditableInputField({
  value,
  onChange,
  onClick,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onClick?: () => void;
  className?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = () => {
    clickTimeout.current = setTimeout(() => {
      onClick?.();
    }, 200);
  };

  const handleDoubleClick = () => {
    if (!clickTimeout.current) return;
    clearTimeout(clickTimeout.current);
    handleClickEdit();
  };

  /**
   * Function to handle the click on the value display
   * to make it editable
   */
  const handleClickEdit = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 0);
  };

  /**
   * Function to handle the update of the value
   */
  const handleUpdate = useCallback(() => {
    // check if the value is empty
    if (inputValue.trim() === "") {
      setInputValue(value);
      setIsEditing(false);
      return;
    }

    // check if the value is different from the current value
    // and update the value
    if (inputValue !== value) {
      onChange(inputValue);
    }

    setIsEditing(false);
  }, [inputValue, value, onChange]);

  /**
   * Function to handle the submit of the form
   * or enter key press.
   * Simply blurs the input to trigger the onBlur event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inputRef.current?.blur();
  };

  // handle value change from external source
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  return (
    <form
      className={[styles.editableInputField, isEditing && styles.editing].join(
        " "
      )}
      onSubmit={handleSubmit}
      onClick={handleClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleUpdate}
          className={className}
        />
      ) : (
        <span
          className={[styles.valueDisplay, className].join(" ")}
          onDoubleClick={handleDoubleClick}
        >
          {value}
        </span>
      )}
    </form>
  );
}
