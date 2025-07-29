import { useEffect, useRef, useState } from "react";

type KeyCombo = {
  /** The main key to trigger (e.g., 's', 'Enter', 'k') */
  key: string;
  /** Require Ctrl key */
  ctrl?: boolean;
  /** Require Meta key (⌘ on Mac, Windows key on Windows) */
  meta?: boolean;
  /** Require Shift key */
  shift?: boolean;
  /** Require Alt key */
  alt?: boolean;
};

type UseHotkeyOptions = {
  /**
   * Array of key combinations to match (e.g. Ctrl+S, Meta+S)
   */
  combos: KeyCombo[];

  /**
   * Whether the shortcut is active
   * @default true
   */
  enabled?: boolean;

  /**
   * Additional runtime condition to allow triggering the callback (e.g. form not submitting)
   */
  condition?: () => boolean;

  /**
   * Function to execute when shortcut is triggered
   */
  callback: () => void;

  /**
   * Throttle duration in milliseconds to prevent rapid triggering
   * @default 1000
   */
  throttleMs?: number;

  /**
   * Ignore shortcut if an input, textarea, or contentEditable element is focused
   * @default true
   */
  ignoreIfFocused?: boolean;
};

/**
 * Utility function to check if a focusable input field is currently focused.
 * Prevents shortcut firing while user is typing in a field.
 */
function isInputFocused() {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  const editable = (el as HTMLElement).isContentEditable;

  return (
    tag === "input" ||
    tag === "textarea" ||
    editable ||
    (el as HTMLInputElement).type === "text" ||
    (el as HTMLInputElement).type === "search" ||
    (el as HTMLInputElement).type === "email" ||
    (el as HTMLInputElement).type === "url" ||
    (el as HTMLInputElement).type === "tel" ||
    (el as HTMLInputElement).type === "number"
  );
}

/**
 * A custom hook to handle keyboard shortcuts with support for:
 * - Multiple key combos (e.g. Ctrl+S and Cmd+S)
 * - Optional condition
 * - Throttling
 * - Input field focus ignoring
 *
 * @example
 * useHotkey({
 *   combos: [{ key: "s", ctrl: true }, { key: "s", meta: true }],
 *   callback: handleSave,
 *   condition: () => !formState.isSubmitting,
 *   throttleMs: 2000,
 * });
 */
export function useHotkey({
  combos,
  enabled = true,
  condition,
  callback,
  throttleMs = 1000,
  ignoreIfFocused = true,
}: UseHotkeyOptions) {
  const lastCallRef = useRef<number>(0); // Stores the last execution timestamp

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Optional: prevent triggering if typing in an input or editable field
      if (ignoreIfFocused && isInputFocused()) return;

      const now = Date.now();

      // Check if any combo matches the current keypress
      const isMatch = combos.some(
        (combo) =>
          event.key.toLowerCase() === combo.key.toLowerCase() &&
          (combo.ctrl === undefined || event.ctrlKey === combo.ctrl) &&
          (combo.meta === undefined || event.metaKey === combo.meta) &&
          (combo.shift === undefined || event.shiftKey === combo.shift) &&
          (combo.alt === undefined || event.altKey === combo.alt)
      );

      if (isMatch) {
        // Extra runtime condition (e.g. not submitting)
        if (!condition || condition()) {
          // Apply throttle
          if (now - lastCallRef.current >= throttleMs) {
            event.preventDefault(); // prevent browser default (e.g. save page)
            lastCallRef.current = now;
            callback();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [combos, enabled, condition, callback, throttleMs, ignoreIfFocused]);
}

export function useModifierKeys() {
  const [modifiers, setModifiers] = useState({
    ctrl: false,
    meta: false,
    shift: false,
    alt: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setModifiers({
        ctrl: e.ctrlKey,
        meta: e.metaKey,
        shift: e.shiftKey,
        alt: e.altKey,
      });
    };
    const handleKeyUp = () => {
      setModifiers({
        ctrl: false,
        meta: false,
        shift: false,
        alt: false,
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return modifiers;
}
