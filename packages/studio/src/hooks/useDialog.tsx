import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Modal from '@/components/base/modal/Modal';

export type TDialogResult<TResult> = {
    status: 'success';
    result?: TResult;
} | {
    status: 'error';
    error?: string;
}

export interface TProps<TResult, TInput> {
    data?: TInput;
    submit: (result?: TResult) => void;
    close: (error?: string) => void;
}

// Internal types for dialog management
interface DialogInstance<TResult = unknown, TInput = unknown> {
    id: string;
    component: React.ComponentType<TProps<TResult, TInput>>;
    props: { data?: TInput };
    resolve: (result?: TDialogResult<TResult>) => void;
}

interface DialogContextValue {
    openDialog: <TResult, TInput>(dialog: Omit<DialogInstance<TResult, TInput>, 'id'>) => string;
    closeDialog: (id: string) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

/**
 * Context that provides the dialog data and functions to the dialog component
 * Users need to place this at the root of the application
 * This component handles the rendering of the dialog composnent using the DialogBackDrop
 * This component also handles the lifecycle and multiple dialogs
 */
export const DialogRenderer = ({ children }: { children: ReactNode }) => {
    const [dialogs, setDialogs] = useState<DialogInstance[]>([]);

    const openDialog = useCallback(<TResult, TInput>(dialog: Omit<DialogInstance<TResult, TInput>, 'id'>) => {
        const id = Math.random().toString(36).substring(7);
        setDialogs((prev) => [...prev, { ...dialog, id } as DialogInstance]);
        return id;
    }, []);

    const closeDialog = useCallback((id: string) => {
        setDialogs((prev) => prev.filter((dialog) => dialog.id !== id));
    }, []);

    const contextValue = { openDialog, closeDialog };

    return (
        <DialogContext.Provider value={contextValue}>
            {children}
            {dialogs.map((dialog) => (
                <DialogBackDrop
                    key={dialog.id}
                    id={dialog.id}
                    component={dialog.component}
                    props={dialog.props}
                    resolve={dialog.resolve}
                />
            ))}
        </DialogContext.Provider>
    );
};

/**
 * React component that renders the dialog backdrop
 * Has ability to close the dialog by clicking outside or pressing the escape key
 */
export const DialogBackDrop = <TResult, TInput>({
    id,
    component: Component,
    props,
    resolve,
}: {
    id: string;
    component: React.ComponentType<TProps<TResult, TInput>>;
    props: { data?: TInput };
    resolve: (result?: TDialogResult<TResult>) => void;
}) => {
    const context = useContext(DialogContext);

    if (!context) {
        throw new Error('DialogBackDrop must be used within DialogRenderer');
    }

    const handleClose = useCallback((error?: string) => {
        resolve({ status: 'error', error });
        context.closeDialog(id);
    }, [id, resolve, context]);

    const handleSubmit = useCallback((result?: TResult) => {
        resolve({ status: 'success', result });
        context.closeDialog(id);
    }, [id, resolve, context]);

    const componentProps = {
        ...props,
        submit: handleSubmit,
        close: handleClose,
    };

    return (
        <Modal onClickOutside={() => handleClose('Dialog closed by user')}>
            <Component {...componentProps} />
        </Modal>
    );
};

/**
 * Method used by users to create a dialog, users will simply pass a component
 * This component should accept the data, submit and close functions as props
 * @param component - React component that will be rendered in the dialog
 * @returns A custom hook that provides open, close, isOpen, and result
 * 
 * @example
 * ```tsx
 * // Define your dialog component
 * const ConfirmDialog = ({ data, submit, close }: TProps<boolean, { message: string }>) => (
 *   <div>
 *     <p>{data.message}</p>
 *     <button onClick={() => submit(true)}>Confirm</button>
 *     <button onClick={() => close()}>Cancel</button>
 *   </div>
 * );
 * 
 * // Create dialog hook
 * const useConfirmDialog = createDialog(ConfirmDialog);
 * 
 * // Use it in your component
 * function MyComponent() {
 *   const { open, close, isOpen, result } = useConfirmDialog();
 * 
 *   const handleDelete = async () => {
 *     const result = await open({ message: 'Are you sure?' });
 *     if (result.status === 'success' && result.result) {
 *       console.log('User confirmed');
 *     }
 *   };
 * 
 *   return <button onClick={handleDelete}>Delete</button>;
 * }
 * ```
 */
export function createDialog<TResult, TInput = void>(
    component: React.ComponentType<TProps<TResult, TInput>>
): () => {
    open: (data?: TInput) => Promise<TDialogResult<TResult>>;
    close: () => void;
    isOpen: boolean;
    result: TDialogResult<TResult> | null;
} {
    return () => {
        const context = useContext(DialogContext);
        const [dialogId, setDialogId] = useState<string | null>(null);
        const [result, setResult] = useState<TDialogResult<TResult> | null>(null);
        const resolveRef = React.useRef<((value: TDialogResult<TResult>) => void) | null>(null);

        if (!context) {
            throw new Error('Dialog hook must be used within DialogRenderer. Make sure DialogRenderer is in your component tree.');
        }

        const open = useCallback((data?: TInput): Promise<TDialogResult<TResult>> => {
            return new Promise((resolve) => {
                resolveRef.current = resolve;
                
                const id = context.openDialog({
                    component,
                    props: { data },
                    resolve: (dialogResult?: TDialogResult<TResult>) => {
                        setResult(dialogResult ?? { status: 'error', error: 'Dialog closed programmatically' });
                        setDialogId(null);
                        resolve(dialogResult ?? { status: 'error', error: 'Dialog closed programmatically' });
                        resolveRef.current = null;
                    },
                });
                
                setDialogId(id);
            });
        }, [context]);

        const close = useCallback(() => {
            if (dialogId && resolveRef.current) {
                const errorResult: TDialogResult<TResult> = {
                    status: 'error',
                    error: 'Dialog closed programmatically',
                };
                setResult(errorResult);
                resolveRef.current(errorResult);
                context.closeDialog(dialogId);
                setDialogId(null);
                resolveRef.current = null;
            }
        }, [dialogId, context]);

        return {
            open,
            close,
            isOpen: dialogId !== null,
            result,
        };
    };
}

/**
 * Hook to use dialog context within React components
 * Provides direct access to openDialog and closeDialog functions
 */
export const useDialog = () => {
    const context = useContext(DialogContext);
    
    if (!context) {
        throw new Error('useDialog must be used within DialogRenderer');
    }
    
    return context;
};