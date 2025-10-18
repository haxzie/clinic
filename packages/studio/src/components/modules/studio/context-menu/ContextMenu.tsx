import { useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import styles from './ContextMenu.module.scss';

export interface ContextMenuOption {
    id: string;
    label: string;
    icon: React.ReactNode;
}

interface ContextMenuProps {
    options: ContextMenuOption[];
    x: number;
    y: number;
    onClose: () => void;
    onSelect: (option: ContextMenuOption) => void;
}

interface ContextMenuItemProps {
    option: ContextMenuOption;
    onSelect: (option: ContextMenuOption) => void;
}

const MENU_MIN_GAP = 8;

function ContextMenuItem({ option, onSelect }: ContextMenuItemProps) {
    return (
        <div
            className={styles.menuItem}
            onClick={() => onSelect(option)}
        >
            <span className={styles.menuItemIcon}>{option.icon}</span>
            <span>{option.label}</span>
        </div>
    );
}

export default function ContextMenu({ options, x, y, onClose, onSelect }: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [isPositioned, setIsPositioned] = useState(false);
    const [position, setPosition] = useState<{ top: number; left: number }>({ top: y, left: x });

    useLayoutEffect(() => {
        const menu = menuRef.current;
        if (!menu) return;
        
        const { innerWidth, innerHeight } = window;
        const rect = menu.getBoundingClientRect();

        let top = y;
        let left = x;

        // Adjust vertical position if menu goes off-screen
        if (y + rect.height + MENU_MIN_GAP > innerHeight) {
            top = Math.max(MENU_MIN_GAP, y - rect.height);
        }
        
        // Adjust horizontal position if menu goes off-screen
        if (x + rect.width + MENU_MIN_GAP > innerWidth) {
            left = Math.max(MENU_MIN_GAP, x - rect.width);
        }

        // Ensure menu stays within viewport bounds
        top = Math.min(Math.max(MENU_MIN_GAP, top), innerHeight - rect.height - MENU_MIN_GAP);
        left = Math.min(Math.max(MENU_MIN_GAP, left), innerWidth - rect.width - MENU_MIN_GAP);

        setPosition({ top, left });
        setIsPositioned(true);
    }, [x, y, options]);

    return (
        <div
            className={styles.backdrop}
            onContextMenu={(e) => e.preventDefault()}
            onMouseDown={() => onClose()}
            onWheel={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
            }}
            onTouchMove={() => onClose()}
        >
            <motion.div
                ref={menuRef}
                className={styles.menu}
                style={{ 
                    top: position.top, 
                    left: position.left,
                    visibility: isPositioned ? 'visible' : 'hidden'
                }}
                onMouseDown={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{
                    duration: 0.12,
                    ease: [0.16, 1, 0.3, 1]
                }}
            >
                {options.map((option) => (
                    <ContextMenuItem
                        key={option.id}
                        option={option}
                        onSelect={onSelect}
                    />
                ))}
            </motion.div>
        </div>
    );
}