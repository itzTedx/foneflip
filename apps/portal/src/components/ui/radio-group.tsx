"use client";

import { useId } from "react";

import { RadioGroup, RadioGroupItem } from "@ziron/ui/radio-group";

type SelectorItem = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectorProps = {
  title?: string;
  items: SelectorItem[];
  value?: string;
  onValueChange?: (value: string) => void;
};

export default function RadioGroupSelector({
  title,
  items,
  value,
  onValueChange,
}: SelectorProps) {
  const id = useId();

  return (
    <fieldset className="space-y-2">
      {title && (
        <legend className="text-sm leading-none font-semibold">
          {title}:
          {value && (
            <span className="text-muted-foreground ml-2 capitalize">
              {items.find((item) => item.value === value)?.label}
            </span>
          )}
        </legend>
      )}
      <RadioGroup
        className="flex flex-wrap gap-2"
        value={value}
        onValueChange={onValueChange}
      >
        {items.map((item) => (
          <label
            key={`${id}-${item.value}-${title}`}
            className="border-input has-data-[state=checked]:border-primary/50 has-data-[state=checked]:bg-primary/5 has-data-[state=checked]:dark:bg-primary/15 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative flex cursor-pointer flex-col items-center gap-3 rounded-md border px-2.5 py-2 text-center capitalize shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px] has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50 dark:bg-input/30 hover:bg-input/50 dark:hover:bg-input/50"
          >
            <RadioGroupItem
              key={`${id}-${item.value}-${title}`}
              value={item.value}
              className="sr-only after:absolute after:inset-0"
              disabled={item.disabled}
            />
            <p className="text-foreground text-sm leading-none font-medium">
              {item.label}
            </p>
          </label>
        ))}
      </RadioGroup>
    </fieldset>
  );
}
