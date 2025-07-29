"use client";

import { ChangeEvent, useEffect, useState } from "react";

type UseCharacterCountProps = {
  maxLength: number;
  value?: string;
  onChange?: (value: string) => void;
};

/**
 * React hook for managing and tracking the character count of an input or textarea with a maximum length.
 *
 * Provides the current value, character count, maximum length, status flags for reaching or exceeding the limit, a status message, and a change handler for use in controlled components.
 *
 * @param maxLength - The maximum allowed number of characters
 * @param value - The current input value (defaults to an empty string)
 * @param onChange - Optional callback invoked with the new value when the input changes
 * @returns An object containing the value, character count, max length, status flags, status message, and a change handler
 */
export function useCharacterCount({
  maxLength,
  value = "",
  onChange,
}: UseCharacterCountProps) {
  const [characterCount, setCharacterCount] = useState(value.length);

  useEffect(() => {
    setCharacterCount(value.length);
  }, [value]);

  const isMaxLengthReached = characterCount >= maxLength;
  const isMaxLengthExceeded = characterCount > maxLength;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value;
    onChange?.(newValue);
  };

  const getStatusMessage = () => {
    if (isMaxLengthExceeded) {
      return "Max length exceeded";
    }
    if (isMaxLengthReached) {
      return "Max length reached";
    }
    return "";
  };

  return {
    value,
    characterCount,
    maxLength,
    isMaxLengthReached,
    isMaxLengthExceeded,
    statusMessage: getStatusMessage(),
    handleChange,
  };
}
