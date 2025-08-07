"use client";

import * as React from "react";

import {
  FileArchiveIcon,
  FileAudioIcon,
  FileCodeIcon,
  FileCogIcon,
  FileIcon,
  FileTextIcon,
  FileVideoIcon,
} from "lucide-react";
import { Slot as SlotPrimitive } from "radix-ui";

import { cn } from "@ziron/utils";

const ROOT_NAME = "FileUpload";
const DROPZONE_NAME = "FileUploadDropzone";
const TRIGGER_NAME = "FileUploadTrigger";
const LIST_NAME = "FileUploadList";
const ITEM_NAME = "FileUploadItem";
const ITEM_PREVIEW_NAME = "FileUploadItemPreview";
const ITEM_METADATA_NAME = "FileUploadItemMetadata";
const ITEM_PROGRESS_NAME = "FileUploadItemProgress";
const ITEM_DELETE_NAME = "FileUploadItemDelete";
const CLEAR_NAME = "FileUploadClear";

function useLazyRef<T>(fn: () => T) {
  const ref = React.useRef<T | null>(null);

  if (ref.current === null) {
    ref.current = fn();
  }

  return ref as React.RefObject<T>;
}

type Direction = "ltr" | "rtl";

const DirectionContext = React.createContext<Direction | undefined>(undefined);

function useDirection(dirProp?: Direction): Direction {
  const contextDir = React.useContext(DirectionContext);
  return dirProp ?? contextDir ?? "ltr";
}

interface FileState {
  file: File;
  progress: number;
  error?: string;
  status: "idle" | "uploading" | "error" | "success";
}

interface StoreState {
  files: Map<File, FileState>;
  dragOver: boolean;
  invalid: boolean;
}

type StoreAction =
  | { type: "ADD_FILES"; files: File[] }
  | { type: "SET_FILES"; files: File[] }
  | { type: "SET_PROGRESS"; file: File; progress: number }
  | { type: "SET_SUCCESS"; file: File }
  | { type: "SET_ERROR"; file: File; error: string }
  | { type: "REMOVE_FILE"; file: File }
  | { type: "SET_DRAG_OVER"; dragOver: boolean }
  | { type: "SET_INVALID"; invalid: boolean }
  | { type: "CLEAR" };

/**
 * Creates a store for managing file upload state, including files, upload progress, drag-and-drop status, and invalid state.
 *
 * The store provides methods to get the current state, dispatch actions to update state, and subscribe to state changes. It also manages object URLs for file previews and notifies when the file list changes.
 *
 * @returns An object with `getState`, `dispatch`, and `subscribe` methods for interacting with the file upload state.
 */
function createStore(
  listeners: Set<() => void>,
  files: Map<File, FileState>,
  urlCache: WeakMap<File, string>,
  invalid: boolean,
  onValueChange?: (files: File[]) => void
) {
  let state: StoreState = {
    files,
    dragOver: false,
    invalid: invalid,
  };

  function reducer(state: StoreState, action: StoreAction): StoreState {
    switch (action.type) {
      case "ADD_FILES": {
        for (const file of action.files) {
          files.set(file, {
            file,
            progress: 0,
            status: "idle",
          });
        }

        if (onValueChange) {
          const fileList = Array.from(files.values()).map((fileState) => fileState.file);
          onValueChange(fileList);
        }
        return { ...state, files };
      }

      case "SET_FILES": {
        const newFileSet = new Set(action.files);
        for (const existingFile of files.keys()) {
          if (!newFileSet.has(existingFile)) {
            files.delete(existingFile);
          }
        }

        for (const file of action.files) {
          const existingState = files.get(file);
          if (!existingState) {
            files.set(file, {
              file,
              progress: 0,
              status: "idle",
            });
          }
        }
        return { ...state, files };
      }

      case "SET_PROGRESS": {
        const fileState = files.get(action.file);
        if (fileState) {
          files.set(action.file, {
            ...fileState,
            progress: action.progress,
            status: "uploading",
          });
        }
        return { ...state, files };
      }

      case "SET_SUCCESS": {
        const fileState = files.get(action.file);
        if (fileState) {
          files.set(action.file, {
            ...fileState,
            progress: 100,
            status: "success",
          });
        }
        return { ...state, files };
      }

      case "SET_ERROR": {
        const fileState = files.get(action.file);
        if (fileState) {
          files.set(action.file, {
            ...fileState,
            error: action.error,
            status: "error",
          });
        }
        return { ...state, files };
      }

      case "REMOVE_FILE": {
        if (urlCache) {
          const cachedUrl = urlCache.get(action.file);
          if (cachedUrl) {
            URL.revokeObjectURL(cachedUrl);
            urlCache.delete(action.file);
          }
        }

        files.delete(action.file);

        if (onValueChange) {
          const fileList = Array.from(files.values()).map((fileState) => fileState.file);
          onValueChange(fileList);
        }
        return { ...state, files };
      }

      case "SET_DRAG_OVER": {
        return { ...state, dragOver: action.dragOver };
      }

      case "SET_INVALID": {
        return { ...state, invalid: action.invalid };
      }

      case "CLEAR": {
        if (urlCache) {
          for (const file of files.keys()) {
            const cachedUrl = urlCache.get(file);
            if (cachedUrl) {
              URL.revokeObjectURL(cachedUrl);
              urlCache.delete(file);
            }
          }
        }

        files.clear();
        if (onValueChange) {
          onValueChange([]);
        }
        return { ...state, files, invalid: false };
      }

      default:
        return state;
    }
  }

  function getState() {
    return state;
  }

  function dispatch(action: StoreAction) {
    state = reducer(state, action);
    for (const listener of listeners) {
      listener();
    }
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { getState, dispatch, subscribe };
}

const StoreContext = React.createContext<ReturnType<typeof createStore> | null>(null);

/**
 * Retrieves the file upload store context, throwing an error if accessed outside the root provider.
 *
 * @param consumerName - The name of the consuming component, used in the error message if the context is missing.
 * @returns The store context object for file upload state management.
 */
function useStoreContext(consumerName: string) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

/**
 * Subscribes to a selected slice of the file upload store state and returns its current value.
 *
 * The selector function determines which part of the store state to observe. The component will re-render when the selected value changes.
 *
 * @param selector - Function that selects a portion of the store state to subscribe to
 * @returns The current value returned by the selector
 */
function useStore<T>(selector: (state: StoreState) => T): T {
  const store = useStoreContext(ROOT_NAME);

  const lastValueRef = useLazyRef<{ value: T; state: StoreState } | null>(() => null);

  const getSnapshot = React.useCallback(() => {
    const state = store.getState();
    const prevValue = lastValueRef.current;

    if (prevValue && prevValue.state === state) {
      return prevValue.value;
    }

    const nextValue = selector(state);
    lastValueRef.current = { value: nextValue, state };
    return nextValue;
  }, [store, selector, lastValueRef]);

  return React.useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

interface FileUploadContextValue {
  inputId: string;
  dropzoneId: string;
  listId: string;
  labelId: string;
  disabled: boolean;
  dir: Direction;
  inputRef: React.RefObject<HTMLInputElement | null>;
  urlCache: WeakMap<File, string>;
}

const FileUploadContext = React.createContext<FileUploadContextValue | null>(null);

/**
 * Retrieves the file upload context for child components.
 *
 * @param consumerName - The name of the consuming component, used in error messages if the context is missing.
 * @returns The current file upload context object.
 * @throws If called outside of a `FileUploadRoot` provider.
 */
function useFileUploadContext(consumerName: string) {
  const context = React.useContext(FileUploadContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface FileUploadRootProps extends Omit<React.ComponentPropsWithoutRef<"div">, "defaultValue" | "onChange"> {
  value?: File[];
  defaultValue?: File[];
  onValueChange?: (files: File[]) => void;
  onAccept?: (files: File[]) => void;
  onFileAccept?: (file: File) => void;
  onFileReject?: (file: File, message: string) => void;
  onFileValidate?: (file: File) => string | null | undefined;
  onUpload?: (
    files: File[],
    options: {
      onProgress: (file: File, progress: number) => void;
      onSuccess: (file: File) => void;
      onError: (file: File, error: Error) => void;
    }
  ) => Promise<void> | void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  dir?: Direction;
  label?: string;
  name?: string;
  asChild?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  multiple?: boolean;
  required?: boolean;
}

/**
 * Root component for the file upload system, managing file selection, validation, upload progress, and state.
 *
 * Provides context and state management for all file upload subcomponents, handling both controlled and uncontrolled usage. Supports drag-and-drop, file type and size validation, custom validation, upload progress tracking, and error handling. Triggers relevant callbacks for file acceptance, rejection, and upload events.
 *
 * @returns The file upload root element with context providers and a hidden file input.
 */
function FileUploadRoot(props: FileUploadRootProps) {
  const {
    value,
    defaultValue,
    onValueChange,
    onAccept,
    onFileAccept,
    onFileReject,
    onFileValidate,
    onUpload,
    accept,
    maxFiles,
    maxSize,
    dir: dirProp,
    label,
    name,
    asChild,
    disabled = false,
    invalid = false,
    multiple = false,
    required = false,
    children,
    className,
    ...rootProps
  } = props;

  const inputId = React.useId();
  const dropzoneId = React.useId();
  const listId = React.useId();
  const labelId = React.useId();

  const dir = useDirection(dirProp);
  const listeners = useLazyRef(() => new Set<() => void>()).current;
  const files = useLazyRef<Map<File, FileState>>(() => new Map()).current;
  const urlCache = useLazyRef(() => new WeakMap<File, string>()).current;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isControlled = value !== undefined;

  const store = React.useMemo(
    () => createStore(listeners, files, urlCache, invalid, onValueChange),
    [listeners, files, invalid, onValueChange, urlCache]
  );

  const acceptTypes = React.useMemo(() => accept?.split(",").map((t) => t.trim()) ?? null, [accept]);

  const onProgress = useLazyRef(() => {
    let frame = 0;
    return (file: File, progress: number) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        store.dispatch({
          type: "SET_PROGRESS",
          file,
          progress: Math.min(Math.max(0, progress), 100),
        });
      });
    };
  }).current;

  React.useEffect(() => {
    if (isControlled) {
      store.dispatch({ type: "SET_FILES", files: value });
    } else if (defaultValue && defaultValue.length > 0 && !store.getState().files.size) {
      store.dispatch({ type: "SET_FILES", files: defaultValue });
    }
  }, [value, defaultValue, isControlled, store]);

  React.useEffect(() => {
    return () => {
      for (const file of files.keys()) {
        const cachedUrl = urlCache.get(file);
        if (cachedUrl) {
          URL.revokeObjectURL(cachedUrl);
        }
      }
    };
  }, [files, urlCache]);

  const onFilesChange = React.useCallback(
    (originalFiles: File[]) => {
      if (disabled) return;

      let filesToProcess = [...originalFiles];
      let invalid = false;

      if (maxFiles) {
        const currentCount = store.getState().files.size;
        const remainingSlotCount = Math.max(0, maxFiles - currentCount);

        if (remainingSlotCount < filesToProcess.length) {
          const rejectedFiles = filesToProcess.slice(remainingSlotCount);
          invalid = true;

          filesToProcess = filesToProcess.slice(0, remainingSlotCount);

          for (const file of rejectedFiles) {
            let rejectionMessage = `Maximum ${maxFiles} files allowed`;

            if (onFileValidate) {
              const validationMessage = onFileValidate(file);
              if (validationMessage) {
                rejectionMessage = validationMessage;
              }
            }

            onFileReject?.(file, rejectionMessage);
          }
        }
      }

      const acceptedFiles: File[] = [];
      const rejectedFiles: { file: File; message: string }[] = [];

      for (const file of filesToProcess) {
        let rejected = false;
        let rejectionMessage = "";

        if (onFileValidate) {
          const validationMessage = onFileValidate(file);
          if (validationMessage) {
            rejectionMessage = validationMessage;
            onFileReject?.(file, rejectionMessage);
            rejected = true;
            invalid = true;
            continue;
          }
        }

        if (acceptTypes) {
          const fileType = file.type;
          const fileExtension = `.${file.name.split(".").pop()}`;

          if (
            !acceptTypes.some(
              (type) =>
                type === fileType ||
                type === fileExtension ||
                (type.includes("/*") && fileType.startsWith(type.replace("/*", "/")))
            )
          ) {
            rejectionMessage = "File type not accepted";
            onFileReject?.(file, rejectionMessage);
            rejected = true;
            invalid = true;
          }
        }

        if (maxSize && file.size > maxSize) {
          rejectionMessage = "File too large";
          onFileReject?.(file, rejectionMessage);
          rejected = true;
          invalid = true;
        }

        if (!rejected) {
          acceptedFiles.push(file);
        } else {
          rejectedFiles.push({ file, message: rejectionMessage });
        }
      }

      if (invalid) {
        store.dispatch({ type: "SET_INVALID", invalid });
        setTimeout(() => {
          store.dispatch({ type: "SET_INVALID", invalid: false });
        }, 2000);
      }

      if (acceptedFiles.length > 0) {
        store.dispatch({ type: "ADD_FILES", files: acceptedFiles });

        if (isControlled && onValueChange) {
          const currentFiles = Array.from(store.getState().files.values()).map((f) => f.file);
          onValueChange([...currentFiles]);
        }

        if (onAccept) {
          onAccept(acceptedFiles);
        }

        for (const file of acceptedFiles) {
          onFileAccept?.(file);
        }

        if (onUpload) {
          requestAnimationFrame(() => {
            onFilesUpload(acceptedFiles);
          });
        }
      }
    },
    [
      store,
      isControlled,
      onValueChange,
      onAccept,
      onFileAccept,
      onUpload,
      maxFiles,
      onFileValidate,
      onFileReject,
      acceptTypes,
      maxSize,
      disabled,
    ]
  );

  const onFilesUpload = React.useCallback(
    async (files: File[]) => {
      try {
        for (const file of files) {
          store.dispatch({ type: "SET_PROGRESS", file, progress: 0 });
        }

        if (onUpload) {
          await onUpload(files, {
            onProgress,
            onSuccess: (file) => {
              store.dispatch({ type: "SET_SUCCESS", file });
            },
            onError: (file, error) => {
              store.dispatch({
                type: "SET_ERROR",
                file,
                error: error.message ?? "Upload failed",
              });
            },
          });
        } else {
          for (const file of files) {
            store.dispatch({ type: "SET_SUCCESS", file });
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Upload failed";
        for (const file of files) {
          store.dispatch({
            type: "SET_ERROR",
            file,
            error: errorMessage,
          });
        }
      }
    },
    [store, onUpload, onProgress]
  );

  const onInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      onFilesChange(files);
      event.target.value = "";
    },
    [onFilesChange]
  );

  const contextValue = React.useMemo<FileUploadContextValue>(
    () => ({
      dropzoneId,
      inputId,
      listId,
      labelId,
      dir,
      disabled,
      inputRef,
      urlCache,
    }),
    [dropzoneId, inputId, listId, labelId, dir, disabled, urlCache]
  );

  const RootPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <StoreContext.Provider value={store}>
      <FileUploadContext.Provider value={contextValue}>
        <RootPrimitive
          data-disabled={disabled ? "" : undefined}
          data-slot="file-upload"
          dir={dir}
          {...rootProps}
          className={cn("relative flex flex-col gap-2", className)}
        >
          {children}
          <input
            accept={accept}
            aria-describedby={dropzoneId}
            aria-labelledby={labelId}
            className="sr-only"
            disabled={disabled}
            id={inputId}
            multiple={multiple}
            name={name}
            onChange={onInputChange}
            ref={inputRef}
            required={required}
            tabIndex={-1}
            type="file"
          />
          <span className="sr-only" id={labelId}>
            {label ?? "File upload"}
          </span>
        </RootPrimitive>
      </FileUploadContext.Provider>
    </StoreContext.Provider>
  );
}

interface FileUploadDropzoneProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
}

/**
 * Provides a drag-and-drop area for uploading files, supporting click, drag, drop, paste, and keyboard interactions.
 *
 * Handles file selection via drag-and-drop, clipboard paste, or keyboard activation, and forwards selected files to the underlying file input. Applies ARIA attributes and state indicators for accessibility and visual feedback.
 */
function FileUploadDropzone(props: FileUploadDropzoneProps) {
  const {
    asChild,
    className,
    onClick: onClickProp,
    onDragOver: onDragOverProp,
    onDragEnter: onDragEnterProp,
    onDragLeave: onDragLeaveProp,
    onDrop: onDropProp,
    onPaste: onPasteProp,
    onKeyDown: onKeyDownProp,
    ...dropzoneProps
  } = props;

  const context = useFileUploadContext(DROPZONE_NAME);
  const store = useStoreContext(DROPZONE_NAME);
  const dragOver = useStore((state) => state.dragOver);
  const invalid = useStore((state) => state.invalid);

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      onClickProp?.(event);

      if (event.defaultPrevented) return;

      const target = event.target;

      const isFromTrigger = target instanceof HTMLElement && target.closest('[data-slot="file-upload-trigger"]');

      if (!isFromTrigger) {
        context.inputRef.current?.click();
      }
    },
    [context.inputRef, onClickProp]
  );

  const onDragOver = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      onDragOverProp?.(event);

      if (event.defaultPrevented) return;

      event.preventDefault();
      store.dispatch({ type: "SET_DRAG_OVER", dragOver: true });
    },
    [store, onDragOverProp]
  );

  const onDragEnter = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      onDragEnterProp?.(event);

      if (event.defaultPrevented) return;

      event.preventDefault();
      store.dispatch({ type: "SET_DRAG_OVER", dragOver: true });
    },
    [store, onDragEnterProp]
  );

  const onDragLeave = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      onDragLeaveProp?.(event);

      if (event.defaultPrevented) return;

      const relatedTarget = event.relatedTarget;
      if (relatedTarget && relatedTarget instanceof Node && event.currentTarget.contains(relatedTarget)) {
        return;
      }

      event.preventDefault();
      store.dispatch({ type: "SET_DRAG_OVER", dragOver: false });
    },
    [store, onDragLeaveProp]
  );

  const onDrop = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      onDropProp?.(event);

      if (event.defaultPrevented) return;

      event.preventDefault();
      store.dispatch({ type: "SET_DRAG_OVER", dragOver: false });

      const files = Array.from(event.dataTransfer.files);
      const inputElement = context.inputRef.current;
      if (!inputElement) return;

      const dataTransfer = new DataTransfer();
      for (const file of files) {
        dataTransfer.items.add(file);
      }

      inputElement.files = dataTransfer.files;
      inputElement.dispatchEvent(new Event("change", { bubbles: true }));
    },
    [store, context.inputRef, onDropProp]
  );

  const onPaste = React.useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      onPasteProp?.(event);

      if (event.defaultPrevented) return;

      event.preventDefault();
      store.dispatch({ type: "SET_DRAG_OVER", dragOver: false });

      const items = event.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item?.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }

      if (files.length === 0) return;

      const inputElement = context.inputRef.current;
      if (!inputElement) return;

      const dataTransfer = new DataTransfer();
      for (const file of files) {
        dataTransfer.items.add(file);
      }

      inputElement.files = dataTransfer.files;
      inputElement.dispatchEvent(new Event("change", { bubbles: true }));
    },
    [store, context.inputRef, onPasteProp]
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDownProp?.(event);

      if (!event.defaultPrevented && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        context.inputRef.current?.click();
      }
    },
    [context.inputRef, onKeyDownProp]
  );

  const DropzonePrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <DropzonePrimitive
      aria-controls={`${context.inputId} ${context.listId}`}
      aria-disabled={context.disabled}
      aria-invalid={invalid}
      data-disabled={context.disabled ? "" : undefined}
      data-dragging={dragOver ? "" : undefined}
      data-invalid={invalid ? "" : undefined}
      data-slot="file-upload-dropzone"
      dir={context.dir}
      id={context.dropzoneId}
      role="region"
      tabIndex={context.disabled ? undefined : 0}
      {...dropzoneProps}
      className={cn(
        "relative flex select-none flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 outline-none transition-colors hover:bg-accent/30 focus-visible:border-ring/50 data-[disabled]:pointer-events-none data-[dragging]:border-primary/30 data-[invalid]:border-destructive data-[dragging]:bg-accent/30 data-[invalid]:ring-destructive/20",
        className
      )}
      onClick={onClick}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
    />
  );
}

interface FileUploadTriggerProps extends React.ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
}

/**
 * Renders a button or custom element that triggers the file input dialog when clicked.
 *
 * Supports rendering as a child component or a native button. Disables interaction if the file upload is disabled.
 */
function FileUploadTrigger(props: FileUploadTriggerProps) {
  const { asChild, onClick: onClickProp, ...triggerProps } = props;
  const context = useFileUploadContext(TRIGGER_NAME);

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClickProp?.(event);

      if (event.defaultPrevented) return;

      context.inputRef.current?.click();
    },
    [context.inputRef, onClickProp]
  );

  const TriggerPrimitive = asChild ? SlotPrimitive.Slot : "button";

  return (
    <TriggerPrimitive
      aria-controls={context.inputId}
      data-disabled={context.disabled ? "" : undefined}
      data-slot="file-upload-trigger"
      type="button"
      {...triggerProps}
      disabled={context.disabled}
      onClick={onClick}
    />
  );
}

interface FileUploadListProps extends React.ComponentPropsWithoutRef<"div"> {
  orientation?: "horizontal" | "vertical";
  asChild?: boolean;
  forceMount?: boolean;
}

/**
 * Renders a container for the list of uploaded files, supporting vertical or horizontal orientation.
 *
 * The list is only rendered if there are files present or if `forceMount` is set to true.
 *
 * @param forceMount - If true, the list is rendered even when there are no files.
 * @param orientation - Layout direction of the list, either "vertical" or "horizontal". Defaults to "vertical".
 */
function FileUploadList(props: FileUploadListProps) {
  const { className, orientation = "vertical", asChild, forceMount, ...listProps } = props;

  const context = useFileUploadContext(LIST_NAME);
  const fileCount = useStore((state) => state.files.size);
  const shouldRender = forceMount || fileCount > 0;

  if (!shouldRender) return null;

  const ListPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <ListPrimitive
      aria-orientation={orientation}
      data-orientation={orientation}
      data-slot="file-upload-list"
      data-state={shouldRender ? "active" : "inactive"}
      dir={context.dir}
      id={context.listId}
      role="list"
      {...listProps}
      className={cn(
        "data-[state=inactive]:fade-out-0 data-[state=active]:fade-in-0 data-[state=inactive]:slide-out-to-top-2 data-[state=active]:slide-in-from-top-2 flex flex-col gap-2 data-[state=active]:animate-in data-[state=inactive]:animate-out",
        orientation === "horizontal" && "flex-row overflow-x-auto p-1.5",
        className
      )}
    />
  );
}

interface FileUploadItemContextValue {
  id: string;
  fileState: FileState | undefined;
  nameId: string;
  sizeId: string;
  statusId: string;
  messageId: string;
}

const FileUploadItemContext = React.createContext<FileUploadItemContextValue | null>(null);

function useFileUploadItemContext(consumerName: string) {
  const context = React.useContext(FileUploadItemContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ITEM_NAME}\``);
  }
  return context;
}

interface FileUploadItemProps extends React.ComponentPropsWithoutRef<"div"> {
  value: File;
  asChild?: boolean;
}

/**
 * Renders a file item within the file upload list, providing accessibility attributes and context for child components.
 *
 * Displays the file's status for assistive technologies and supplies contextual information such as file state, index, and IDs to descendants.
 *
 * @param props - Props including the file value, optional custom element rendering, and additional attributes.
 * @returns The rendered file item or `null` if the file state is not found.
 */
function FileUploadItem(props: FileUploadItemProps) {
  const { value, asChild, className, ...itemProps } = props;

  const id = React.useId();
  const statusId = `${id}-status`;
  const nameId = `${id}-name`;
  const sizeId = `${id}-size`;
  const messageId = `${id}-message`;

  const context = useFileUploadContext(ITEM_NAME);
  const fileState = useStore((state) => state.files.get(value));
  const fileCount = useStore((state) => state.files.size);
  const fileIndex = useStore((state) => {
    const files = Array.from(state.files.keys());
    return files.indexOf(value) + 1;
  });

  const itemContext = React.useMemo(
    () => ({
      id,
      fileState,
      nameId,
      sizeId,
      statusId,
      messageId,
    }),
    [id, fileState, statusId, nameId, sizeId, messageId]
  );

  if (!fileState) return null;

  const statusText = fileState.error
    ? `Error: ${fileState.error}`
    : fileState.status === "uploading"
      ? `Uploading: ${fileState.progress}% complete`
      : fileState.status === "success"
        ? "Upload complete"
        : "Ready to upload";

  const ItemPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <FileUploadItemContext.Provider value={itemContext}>
      <ItemPrimitive
        aria-describedby={`${nameId} ${sizeId} ${statusId} ${fileState.error ? messageId : ""}`}
        aria-labelledby={nameId}
        aria-posinset={fileIndex}
        aria-setsize={fileCount}
        data-slot="file-upload-item"
        dir={context.dir}
        id={id}
        role="listitem"
        {...itemProps}
        className={cn("relative flex items-center gap-2.5 rounded-md border p-3", className)}
      >
        {props.children}
        <span className="sr-only" id={statusId}>
          {statusText}
        </span>
      </ItemPrimitive>
    </FileUploadItemContext.Provider>
  );
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${sizes[i]}`;
}

function getFileIcon(file: File) {
  const type = file.type;
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (type.startsWith("video/")) {
    return <FileVideoIcon />;
  }

  if (type.startsWith("audio/")) {
    return <FileAudioIcon />;
  }

  if (type.startsWith("text/") || ["txt", "md", "rtf", "pdf"].includes(extension)) {
    return <FileTextIcon />;
  }

  if (
    ["html", "css", "js", "jsx", "ts", "tsx", "json", "xml", "php", "py", "rb", "java", "c", "cpp", "cs"].includes(
      extension
    )
  ) {
    return <FileCodeIcon />;
  }

  if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(extension)) {
    return <FileArchiveIcon />;
  }

  if (["exe", "msi", "app", "apk", "deb", "rpm"].includes(extension) || type.startsWith("application/")) {
    return <FileCogIcon />;
  }

  return <FileIcon />;
}

interface FileUploadItemPreviewProps extends React.ComponentPropsWithoutRef<"div"> {
  render?: (file: File) => React.ReactNode;
  asChild?: boolean;
}

/**
 * Renders a preview for a file in the upload list, displaying either a custom preview, an image thumbnail, or a file-type icon.
 *
 * If a `render` function is provided, it is used to render the preview. For image files, a thumbnail is shown using an object URL. For other file types, an appropriate icon is displayed.
 *
 * @returns The file preview element or `null` if no file state is available.
 */
function FileUploadItemPreview(props: FileUploadItemPreviewProps) {
  const { render, asChild, children, className, ...previewProps } = props;

  const itemContext = useFileUploadItemContext(ITEM_PREVIEW_NAME);
  const context = useFileUploadContext(ITEM_PREVIEW_NAME);

  const onPreviewRender = React.useCallback(
    (file: File) => {
      if (render) return render(file);

      if (itemContext.fileState?.file.type.startsWith("image/")) {
        let url = context.urlCache.get(file);
        if (!url) {
          url = URL.createObjectURL(file);
          context.urlCache.set(file, url);
        }

        return <img alt={file.name} className="size-full object-cover" src={url} />;
      }

      return getFileIcon(file);
    },
    [render, itemContext.fileState?.file.type, context.urlCache]
  );

  if (!itemContext.fileState) return null;

  const ItemPreviewPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <ItemPreviewPrimitive
      aria-labelledby={itemContext.nameId}
      data-slot="file-upload-preview"
      {...previewProps}
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded border bg-accent/50 [&>svg]:size-10",
        className
      )}
    >
      {onPreviewRender(itemContext.fileState.file)}
      {children}
    </ItemPreviewPrimitive>
  );
}

interface FileUploadItemMetadataProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
  size?: "default" | "sm";
}

/**
 * Displays metadata for a file upload item, including file name, size, and error message if present.
 *
 * Renders custom children if provided; otherwise, shows the file's name, formatted size, and any error message.
 */
function FileUploadItemMetadata(props: FileUploadItemMetadataProps) {
  const { asChild, size = "default", children, className, ...metadataProps } = props;

  const context = useFileUploadContext(ITEM_METADATA_NAME);
  const itemContext = useFileUploadItemContext(ITEM_METADATA_NAME);

  if (!itemContext.fileState) return null;

  const ItemMetadataPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <ItemMetadataPrimitive
      data-slot="file-upload-metadata"
      dir={context.dir}
      {...metadataProps}
      className={cn("flex min-w-0 flex-1 flex-col", className)}
    >
      {children ?? (
        <>
          <span
            className={cn("truncate font-medium text-sm", size === "sm" && "font-normal text-[13px] leading-snug")}
            id={itemContext.nameId}
          >
            {itemContext.fileState.file.name}
          </span>
          <span
            className={cn("truncate text-muted-foreground text-xs", size === "sm" && "text-[11px] leading-snug")}
            id={itemContext.sizeId}
          >
            {formatBytes(itemContext.fileState.file.size)}
          </span>
          {itemContext.fileState.error && (
            <span className="text-destructive text-xs" id={itemContext.messageId}>
              {itemContext.fileState.error}
            </span>
          )}
        </>
      )}
    </ItemMetadataPrimitive>
  );
}
interface FileUploadItemProgressProps extends React.ComponentPropsWithoutRef<"div"> {
  variant?: "linear" | "circular" | "fill";
  size?: number;
  asChild?: boolean;
  forceMount?: boolean;
}

/**
 * Renders the upload progress indicator for a file item in one of three visual variants: linear, circular, or fill.
 *
 * Displays the progress bar only if the file is not fully uploaded, unless forced by the `forceMount` prop.
 *
 * @param variant - The visual style of the progress indicator ("linear", "circular", or "fill").
 * @param size - The size of the progress indicator (applies to the circular variant).
 * @param forceMount - If true, always renders the progress indicator regardless of progress.
 * @returns The progress indicator element, or null if not applicable.
 */
function FileUploadItemProgress(props: FileUploadItemProgressProps) {
  const { variant = "linear", size = 40, asChild, forceMount, className, ...progressProps } = props;

  const itemContext = useFileUploadItemContext(ITEM_PROGRESS_NAME);

  if (!itemContext.fileState) return null;

  const shouldRender = forceMount || itemContext.fileState.progress !== 100;

  if (!shouldRender) return null;

  const ItemProgressPrimitive = asChild ? SlotPrimitive.Slot : "div";

  switch (variant) {
    case "circular": {
      const circumference = 2 * Math.PI * ((size - 4) / 2);
      const strokeDashoffset = circumference - (itemContext.fileState.progress / 100) * circumference;

      return (
        <ItemProgressPrimitive
          aria-labelledby={itemContext.nameId}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={itemContext.fileState.progress}
          aria-valuetext={`${itemContext.fileState.progress}%`}
          data-slot="file-upload-progress"
          role="progressbar"
          {...progressProps}
          className={cn("-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2", className)}
        >
          <svg
            className="rotate-[-90deg] transform"
            fill="none"
            height={size}
            stroke="currentColor"
            viewBox={`0 0 ${size} ${size}`}
            width={size}
          >
            <circle className="text-primary/20" cx={size / 2} cy={size / 2} r={(size - 4) / 2} strokeWidth="2" />
            <circle
              className="text-primary transition-[stroke-dashoffset] duration-300 ease-linear"
              cx={size / 2}
              cy={size / 2}
              r={(size - 4) / 2}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              strokeWidth="2"
            />
          </svg>
        </ItemProgressPrimitive>
      );
    }

    case "fill": {
      const progressPercentage = itemContext.fileState.progress;
      const topInset = 100 - progressPercentage;

      return (
        <ItemProgressPrimitive
          aria-labelledby={itemContext.nameId}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={progressPercentage}
          aria-valuetext={`${progressPercentage}%`}
          data-slot="file-upload-progress"
          role="progressbar"
          {...progressProps}
          className={cn("absolute inset-0 bg-primary/50 transition-[clip-path] duration-300 ease-linear", className)}
          style={{
            clipPath: `inset(${topInset}% 0% 0% 0%)`,
          }}
        />
      );
    }

    default:
      return (
        <ItemProgressPrimitive
          aria-labelledby={itemContext.nameId}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={itemContext.fileState.progress}
          aria-valuetext={`${itemContext.fileState.progress}%`}
          data-slot="file-upload-progress"
          role="progressbar"
          {...progressProps}
          className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-primary/20", className)}
        >
          <div
            className="h-full w-full flex-1 bg-primary transition-transform duration-300 ease-linear"
            style={{
              transform: `translateX(-${100 - itemContext.fileState.progress}%)`,
            }}
          />
        </ItemProgressPrimitive>
      );
  }
}

interface FileUploadItemDeleteProps extends React.ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
}

/**
 * Renders a button or custom element to remove a file from the upload list.
 *
 * Triggers removal of the associated file when clicked. If `asChild` is true, renders a custom component via slotting; otherwise, renders a native button.
 */
function FileUploadItemDelete(props: FileUploadItemDeleteProps) {
  const { asChild, onClick: onClickProp, ...deleteProps } = props;

  const store = useStoreContext(ITEM_DELETE_NAME);
  const itemContext = useFileUploadItemContext(ITEM_DELETE_NAME);

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClickProp?.(event);

      if (!itemContext.fileState || event.defaultPrevented) return;

      store.dispatch({
        type: "REMOVE_FILE",
        file: itemContext.fileState.file,
      });
    },
    [store, itemContext.fileState, onClickProp]
  );

  if (!itemContext.fileState) return null;

  const ItemDeletePrimitive = asChild ? SlotPrimitive.Slot : "button";

  return (
    <ItemDeletePrimitive
      aria-controls={itemContext.id}
      aria-describedby={itemContext.nameId}
      data-slot="file-upload-item-delete"
      type="button"
      {...deleteProps}
      onClick={onClick}
    />
  );
}

interface FileUploadClearProps extends React.ComponentPropsWithoutRef<"button"> {
  forceMount?: boolean;
  asChild?: boolean;
}

/**
 * Renders a button that clears all files from the file upload list.
 *
 * The button is disabled if the upload component or this button is disabled. It is only rendered if there are files present or if `forceMount` is true. When clicked, it dispatches a clear action to remove all files.
 *
 * @param forceMount - If true, the button is rendered even when there are no files.
 * @param asChild - If true, renders the button as a child component using a slot.
 * @param disabled - If true, disables the button.
 */
function FileUploadClear(props: FileUploadClearProps) {
  const { asChild, forceMount, disabled, onClick: onClickProp, ...clearProps } = props;

  const context = useFileUploadContext(CLEAR_NAME);
  const store = useStoreContext(CLEAR_NAME);
  const fileCount = useStore((state) => state.files.size);

  const isDisabled = disabled || context.disabled;

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClickProp?.(event);

      if (event.defaultPrevented) return;

      store.dispatch({ type: "CLEAR" });
    },
    [store, onClickProp]
  );

  const shouldRender = forceMount || fileCount > 0;

  if (!shouldRender) return null;

  const ClearPrimitive = asChild ? SlotPrimitive.Slot : "button";

  return (
    <ClearPrimitive
      aria-controls={context.listId}
      data-disabled={isDisabled ? "" : undefined}
      data-slot="file-upload-clear"
      type="button"
      {...clearProps}
      disabled={isDisabled}
      onClick={onClick}
    />
  );
}

export {
  FileUploadClear as Clear,
  FileUploadDropzone as Dropzone,
  FileUploadRoot as FileUpload,
  FileUploadClear,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  FileUploadTrigger,
  FileUploadItem as Item,
  FileUploadItemDelete as ItemDelete,
  FileUploadItemMetadata as ItemMetadata,
  FileUploadItemPreview as ItemPreview,
  FileUploadItemProgress as ItemProgress,
  FileUploadList as List,
  //
  FileUploadRoot as Root,
  FileUploadTrigger as Trigger,
  //
  useStore as useFileUpload,
  //
  type FileUploadRootProps as FileUploadProps,
};
