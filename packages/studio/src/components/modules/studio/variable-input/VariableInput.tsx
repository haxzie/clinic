import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import useApiStore from '@/store/api-store/api.store';
import { useShallow } from 'zustand/shallow';
import { createPortal } from 'react-dom';
import styles from './VariableInput.module.scss';

interface VariableInputProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onPaste?: (e: React.ClipboardEvent<HTMLDivElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  className?: string;
  placeholder?: string;
  spellCheck?: boolean;
}

interface ParsedSegment {
  text: string;
  isVariable: boolean;
  isValid?: boolean;
  variableValue?: string;
}

/**
 * VariableInput - An input component that highlights environment variables
 * 
 * Highlights variables in the format {{variableName}} with:
 * - Green: variable is defined and has a value
 * - Red: variable is undefined or has no value
 * 
 * @example
 * <VariableInput 
 *   value={url} 
 *   onChange={setUrl}
 * />
 */
export default function VariableInput({
  value,
  onChange,
  onFocus,
  onBlur,
  onPaste,
  onKeyDown,
  className,
  placeholder,
  spellCheck = false,
}: VariableInputProps) {
  const editableRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const tooltipTimeoutRef = useRef<number | null>(null);
  const lastValueRef = useRef(value);
  const hasMountedRef = useRef(false);

  // Get environment data from store
  const { environments, activeEnvironmentId } = useApiStore(
    useShallow((state) => ({
      environments: state.environments,
      activeEnvironmentId: state.activeEnvironmentId,
    }))
  );

  // Get merged environment variables for tooltip lookup
  const mergedVariables = useMemo(() => {
    const defaultEnv = environments['default'];
    const activeEnv = environments[activeEnvironmentId];
    
    const merged: Record<string, { name: string; value: string }> = {};
    
    // Add default environment variables
    if (defaultEnv?.data?.variables) {
      Object.values(defaultEnv.data.variables).forEach((variable) => {
        merged[variable.name] = variable;
      });
    }
    
    // Overlay active environment variables (overrides defaults)
    if (activeEnv?.data?.variables && activeEnv.id !== 'default') {
      Object.values(activeEnv.data.variables).forEach((variable) => {
        merged[variable.name] = variable;
      });
    }
    
    return merged;
  }, [environments, activeEnvironmentId]);

  // Parse text and check variable validity
  const parseText = useCallback((text: string): ParsedSegment[] => {
    if (!text) return [];

    const segments: ParsedSegment[] = [];
    const regex = /(\{\{\w+\}\})/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before the variable
      if (match.index > lastIndex) {
        segments.push({
          text: text.substring(lastIndex, match.index),
          isVariable: false,
        });
      }

      // Extract variable name from {{variableName}}
      const variableName = match[0].slice(2, -2);
      const variable = mergedVariables[variableName];
      
      // Check if variable exists and has a value
      const isValid = Boolean(variable && variable.value && variable.value.trim() !== '');

      segments.push({
        text: match[0],
        isVariable: true,
        isValid,
        variableValue: variable?.value || undefined,
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after the last variable
    if (lastIndex < text.length) {
      segments.push({
        text: text.substring(lastIndex),
        isVariable: false,
      });
    }

    return segments;
  }, [mergedVariables]);

  // Handle tooltip on hover
  const handleVariableMouseEnter = useCallback((e: MouseEvent, tooltipText: string) => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }

    tooltipTimeoutRef.current = window.setTimeout(() => {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setTooltip({
        text: tooltipText,
        x: rect.left + rect.width / 2,
        y: rect.top - 8,
      });
    }, 300);
  }, []);

  const handleVariableMouseLeave = useCallback(() => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    setTooltip(null);
  }, []);

  // Save cursor position
  const saveCursorPosition = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editableRef.current) return null;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editableRef.current);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    const caretOffset = preCaretRange.toString().length;

    return caretOffset;
  }, []);

  // Restore cursor position
  const restoreCursorPosition = useCallback((caretOffset: number) => {
    if (!editableRef.current) return;

    const selection = window.getSelection();
    if (!selection) return;

    let currentOffset = 0;
    let targetNode: Node | null = null;
    let targetOffset = 0;

    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const textLength = node.textContent?.length || 0;
        if (currentOffset + textLength >= caretOffset) {
          targetNode = node;
          targetOffset = caretOffset - currentOffset;
          return true;
        }
        currentOffset += textLength;
      } else {
        for (let i = 0; i < node.childNodes.length; i++) {
          if (walk(node.childNodes[i])) return true;
        }
      }
      return false;
    };

    walk(editableRef.current);

    if (targetNode) {
      const range = document.createRange();
      range.setStart(targetNode, targetOffset);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, []);

  // Render highlighted content to the contenteditable
  const renderContent = useCallback((text: string, preserveCursor = false) => {
    if (!editableRef.current) return;
    
    const cursorPosition = preserveCursor ? saveCursorPosition() : null;
    
    const segments = parseText(text);
    editableRef.current.innerHTML = '';
    
    segments.forEach((segment) => {
      const span = document.createElement('span');
      span.textContent = segment.text;
      
      if (segment.isVariable) {
        span.className = segment.isValid ? styles.validVariable : styles.invalidVariable;
        const tooltipText = segment.isValid && segment.variableValue
          ? segment.variableValue
          : 'Variable not defined or empty';
        
        span.addEventListener('mouseenter', (e: MouseEvent) => {
          handleVariableMouseEnter(e, tooltipText);
        });
        span.addEventListener('mouseleave', handleVariableMouseLeave);
      }
      
      editableRef.current!.appendChild(span);
    });

    if (cursorPosition !== null) {
      restoreCursorPosition(cursorPosition);
    }
  }, [parseText, styles.validVariable, styles.invalidVariable, handleVariableMouseEnter, handleVariableMouseLeave, saveCursorPosition, restoreCursorPosition]);

  // Handle input changes
  const handleInput = useCallback(() => {
    if (isComposingRef.current) return;
    
    const text = editableRef.current?.textContent || '';
    
    // Only update if text has actually changed
    if (text === lastValueRef.current) return;
    
    lastValueRef.current = text;
    onChange(text);
    
    // Render with highlighting in real-time
    // Use requestAnimationFrame to ensure onChange completes first
    requestAnimationFrame(() => {
      renderContent(text, true);
    });
  }, [onChange, renderContent]);

  // Handle paste - strip formatting and paste as plain text
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const text = e.clipboardData.getData('text/plain');
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    selection.deleteFromDocument();
    const range = selection.getRangeAt(0);
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    
    // Move cursor after inserted text
    range.setStartAfter(textNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Trigger input handling which will re-render with highlighting
    handleInput();
    
    if (onPaste) {
      onPaste(e);
    }
  }, [handleInput, onPaste]);

  // Handle composition events for IME input
  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false;
    handleInput();
  }, [handleInput]);

  // Handle keydown - prevent Enter from creating new lines
  const handleKeyDownEvent = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
    
    if (onKeyDown) {
      onKeyDown(e);
    }
  }, [onKeyDown]);

  // Handle focus - keep plain text during editing
  const handleFocusEvent = useCallback(() => {
    if (onFocus) onFocus();
  }, [onFocus]);

  // Handle blur - re-render with highlighting
  const handleBlurEvent = useCallback(() => {
    const text = editableRef.current?.textContent || '';
    lastValueRef.current = text;
    renderContent(text);
    if (onBlur) onBlur();
  }, [onBlur, renderContent]);

  // Initial render and updates from external value changes
  useEffect(() => {
    if (!editableRef.current) return;

    // Initial mount - always render
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      lastValueRef.current = value;
      renderContent(value);
      return;
    }

    // Subsequent updates - only if value actually changed
    if (value !== lastValueRef.current) {
      const currentText = editableRef.current.textContent || '';
      if (currentText !== value) {
        lastValueRef.current = value;
        renderContent(value);
      }
    }
  }, [value, renderContent]);

  // Cleanup tooltip timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div 
        ref={editableRef}
        className={`${styles.variableInput} ${className || ''}`}
        contentEditable
        onInput={handleInput}
        onFocus={handleFocusEvent}
        onBlur={handleBlurEvent}
        onPaste={handlePaste}
        onKeyDown={handleKeyDownEvent}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        spellCheck={spellCheck}
        data-placeholder={placeholder}
        role="textbox"
        aria-multiline="false"
      />
      
      {/* Portal tooltip to avoid parent overflow issues */}
      {tooltip && createPortal(
        <div
          className={styles.tooltip}
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {tooltip.text}
        </div>,
        document.body
      )}
    </>
  );
}
