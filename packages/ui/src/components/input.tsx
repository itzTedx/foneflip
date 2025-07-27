import * as React from "react";

import { cn } from "@ziron/utils";

import { MinusIcon, PlusIcon } from "lucide-react";
import type { NumberFieldProps } from "react-aria-components";
import { Input as AriaInput, Button, Group, NumberField } from "react-aria-components";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm hover:bg-input/20 dark:hover:bg-input/40",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

function NumberInput(
  props: NumberFieldProps
) {
  return (
    <NumberField {...props}>
      <Group className="border-input data-[focus-within]:border-ring data-[focus-within]:ring-ring/50 data-[focus-within]:has-[[aria-invalid=true]]:ring-destructive/20 dark:data-[focus-within]:has-[[aria-invalid=true]]:ring-destructive/40 data-[focus-within]:has-[[aria-invalid=true]]:border-destructive relative inline-flex h-9 w-full items-center overflow-hidden rounded-md border text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none data-[disabled]:opacity-50 data-[focus-within]:ring-[3px] hover:bg-input/20 dark:hover:bg-input/40 dark:bg-input/30">
        <Button
          slot="decrement"
          className="border-input text-muted-foreground/80 hover:bg-accent hover:text-foreground -ms-px flex aspect-square h-[inherit] items-center justify-center rounded-s-md border bg-transparent text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MinusIcon size={16} aria-hidden="true" />
        </Button>
        <AriaInput
          className="text-foreground w-full grow bg-transparent px-3 py-2 text-center tabular-nums"
          inputMode="numeric"
          pattern="[0-9]*"
        />
        <Button
          slot="increment"
          className="border-input text-muted-foreground/80 hover:bg-accent hover:text-foreground -me-px flex aspect-square h-[inherit] items-center justify-center rounded-e-md border bg-transparent text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PlusIcon size={16} aria-hidden="true" />
        </Button>
      </Group>
    </NumberField>
  );
}

export { Input, NumberInput };
