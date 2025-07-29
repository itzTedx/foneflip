"use client";

import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Label as LabelPrimitive, Slot as SlotPrimitive } from "radix-ui";
import type { ControllerProps, FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useFieldArray,
  useForm,
  useFormContext,
  useFormState,
} from "react-hook-form";

import { Label, LabelAsterisk } from "@ziron/ui/label";
import { cn } from "@ziron/utils";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

/**
 * Provides a context for a form item and renders a div with a unique ID for accessibility.
 *
 * Wraps its children in a div with a generated ID and supplies this ID via context to descendant components.
 *
 * @param className - Additional CSS classes to apply to the form item container.
 */
function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn("grid gap-2", className)} data-slot="form-item" {...props} />
    </FormItemContext.Provider>
  );
}

/**
 * Renders a form field label linked to its control, with optional required indicator and error styling.
 *
 * Displays an asterisk if the field is required and applies error styling when validation errors are present.
 *
 * @param children - The label content to display
 * @param required - Whether to show an asterisk indicating the field is required
 */
function FormLabel({
  className,
  children,
  required,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & { required?: boolean }) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      className={cn("data-[error=true]:text-destructive", className)}
      data-error={!!error}
      data-slot="form-label"
      htmlFor={formItemId}
      {...props}
    >
      {children}
      {required && <LabelAsterisk />}
    </Label>
  );
}

/**
 * Wraps a form control element, applying accessibility attributes and linking it to form field state.
 *
 * Sets ARIA attributes for error and description messages, and assigns a unique ID for accessibility.
 */
function FormControl({ ...props }: React.ComponentProps<typeof SlotPrimitive.Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <SlotPrimitive.Slot
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      data-slot="form-control"
      id={formItemId}
      {...props}
    />
  );
}

/**
 * Renders a form field description with appropriate accessibility attributes.
 *
 * Associates the description with its form field for screen readers using a unique ID.
 */
function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      className={cn("text-muted-foreground text-xs", className)}
      data-slot="form-description"
      id={formDescriptionId}
      {...props}
    />
  );
}

/**
 * Displays a validation error message for a form field, or custom content if no error is present.
 *
 * Returns `null` if there is no error message or children to display.
 */
function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : props.children;

  if (!body) {
    return null;
  }

  return (
    <p className={cn("text-destructive text-sm", className)} data-slot="form-message" id={formMessageId} {...props}>
      {body}
    </p>
  );
}

export {
  FieldValues,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFieldArray,
  useForm,
  useFormContext,
  useFormField,
  UseFormReturn,
  zodResolver,
  type SubmitHandler,
};
