import { FieldValues, UseFormReturn } from "@ziron/ui/form";
import { useDebounce } from "@ziron/ui/hooks/use-debounce";
import { useEffect, useState } from "react";

/**
 * Invokes a callback with debounced form values whenever they change.
 *
 * Watches values from a `react-hook-form` form instance, applies a debounce delay, and calls the provided callback with the latest debounced values. Re-subscribes to form changes when dependencies update.
 *
 * @param delay - The debounce delay in milliseconds
 * @param callback - Function called with the debounced form values when they change
 * @param deps - Optional dependencies that trigger re-subscription to form value changes
 */
export function useWatchWithDebounce<T extends FieldValues>(
  form: UseFormReturn<T>,
  delay: number,
  callback: (values: Partial<T>) => void,
  deps: React.DependencyList = []
): void {
  const [watchedValues, setWatchedValues] = useState<Partial<T>>();

  useEffect(() => {
    const subscription = form.watch((values) => {
      setWatchedValues(values);
    });
    return () => subscription.unsubscribe();
  }, [form, ...deps]);

  const debouncedValues = useDebounce(watchedValues, delay);

  useEffect(() => {
    if (debouncedValues !== undefined) {
      callback(debouncedValues);
    }
  }, [debouncedValues, callback]);
}
