"use client";

import { ChangeEvent, useEffect, useState } from "react";

type UseCharacterCountProps = {
  maxLength: number;
  value?: string;
  onChange?: (value: string) => void;
};

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
