import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'motion/react';
import ContextMenu, { ContextMenuOption } from '../components/modules/studio/context-menu/ContextMenu';

type Coords = { x: number; y: number };
type OpenHandlers = { onSelect?: (option: ContextMenuOption) => void } | undefined;

interface ContextMenuState {
    id: string;
    options: ContextMenuOption[];
    coords: Coords;
    onSelect: ((option: ContextMenuOption) => void) | null;
}

// Global state management
let contextMenuState: ContextMenuState | null = null;
const subscribers: Array<() => void> = [];

function subscribe(callback: () => void) {
    subscribers.push(callback);
    return () => {
        const index = subscribers.indexOf(callback);
        if (index > -1) subscribers.splice(index, 1);
    };
}

function notifySubscribers() {
    subscribers.forEach(callback => callback());
}

function openContextMenu(state: ContextMenuState) {
    contextMenuState = state;
    notifySubscribers();
}

function closeContextMenu() {
    contextMenuState = null;
    notifySubscribers();
}

function ContextMenuWrapper(props: {
    options: ContextMenuOption[];
    x: number;
    y: number;
    onClose: () => void;
    onSelect: (option: ContextMenuOption) => void;
}) {
    const { onClose } = props;

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        const onResize = () => onClose();

        window.addEventListener('keydown', onKey, { passive: true });
        window.addEventListener('resize', onResize, { passive: true });
        return () => {
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('resize', onResize);
        };
    }, [onClose]);

    return <ContextMenu {...props} />;
}

// Hook to open context menus
export const useContextMenu = ({ options }: { options: ContextMenuOption[] }) => {
    const menuId = useRef(`context-menu-${Math.random().toString(36).substr(2, 9)}`);

    const open = ({ x, y }: Coords, handlers?: OpenHandlers) => {
        openContextMenu({
            id: menuId.current,
            options,
            coords: { x, y },
            onSelect: handlers?.onSelect ?? null,
        });
    };

    const close = () => {
        if (contextMenuState?.id === menuId.current) {
            closeContextMenu();
        }
    };

    return { open, close, isOpen: !!contextMenuState?.id };
};

// Component that renders the context menu
export function ContextMenuRenderer() {
    const [, forceUpdate] = useState({});

    useEffect(() => {
        return subscribe(() => forceUpdate({}));
    }, []);

    if (typeof window === 'undefined' || !contextMenuState) return null;

    const studioRoot = document.querySelector('.apiclinic-studio');
    const portalElement = (studioRoot as HTMLElement | null) ?? document.body;
    if (!portalElement) return null;

    const handleSelect = (opt: ContextMenuOption) => {
        try {
            if (contextMenuState?.onSelect) {
                contextMenuState.onSelect(opt);
            }
        } finally {
            closeContextMenu();
        }
    };

    return createPortal(
        <AnimatePresence>
            {contextMenuState && (
                <ContextMenuWrapper
                    options={contextMenuState.options}
                    x={contextMenuState.coords.x}
                    y={contextMenuState.coords.y}
                    onClose={closeContextMenu}
                    onSelect={handleSelect}
                />
            )}
        </AnimatePresence>,
        portalElement
    );
}

