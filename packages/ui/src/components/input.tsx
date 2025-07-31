import * as React from "react";
import { type ComponentProps } from "react";

import { MinusIcon, PlusIcon } from "lucide-react";
import type { NumberFieldProps } from "react-aria-components";
import { Input as AriaInput, Button, Group, NumberField } from "react-aria-components";

import { cn } from "@ziron/utils";

/****
 * Renders a styled input element with support for various states and accessibility features.
 *
 * Applies consistent styling for focus, hover, disabled, and invalid states, and forwards all standard input props to the underlying element.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground hover:bg-input/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 dark:hover:bg-input/40",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className
      )}
      data-slot="input"
      type={type}
      {...props}
    />
  );
}

/**
 * Renders an accessible numeric input field with increment and decrement buttons.
 *
 * Provides a styled number input using `react-aria-components`, supporting keyboard and button-based value changes, accessibility features, and visual feedback for focus, invalid, disabled, and hover states.
 */
function NumberInput(props: NumberFieldProps) {
  return (
    <NumberField {...props}>
      <Group className="relative inline-flex h-9 w-full items-center overflow-hidden whitespace-nowrap rounded-md border border-input text-sm shadow-xs outline-none transition-[color,box-shadow] hover:bg-input/20 data-[focus-within]:border-ring data-[disabled]:opacity-50 data-[focus-within]:ring-[3px] data-[focus-within]:ring-ring/50 data-[focus-within]:has-[[aria-invalid=true]]:border-destructive data-[focus-within]:has-[[aria-invalid=true]]:ring-destructive/20 dark:bg-input/30 dark:data-[focus-within]:has-[[aria-invalid=true]]:ring-destructive/40 dark:hover:bg-input/40">
        <Button
          className="-ms-px flex aspect-square h-[inherit] items-center justify-center rounded-s-md border border-input bg-transparent text-muted-foreground/80 text-sm transition-[color,box-shadow] hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          slot="decrement"
        >
          <MinusIcon aria-hidden="true" size={16} />
        </Button>
        <AriaInput
          className="w-full grow bg-transparent px-3 py-2 text-center text-foreground tabular-nums"
          inputMode="numeric"
          pattern="[0-9]*"
        />
        <Button
          className="-me-px flex aspect-square h-[inherit] items-center justify-center rounded-e-md border border-input bg-transparent text-muted-foreground/80 text-sm transition-[color,box-shadow] hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          slot="increment"
        >
          <PlusIcon aria-hidden="true" size={16} />
        </Button>
      </Group>
    </NumberField>
  );
}

function NumInput({
  onChange,
  value,
  ...props
}: Omit<ComponentProps<typeof Input>, "type" | "onChange" | "value"> & {
  onChange: (value: number | null) => void;
  value: undefined | null | number;
}) {
  return (
    <Input
      {...props}
      onChange={(e) => {
        const number = e.target.valueAsNumber;
        onChange(isNaN(number) ? null : number);
      }}
      type="number"
      value={value ?? ""}
    />
  );
}

export { Input, NumberInput, NumInput };
