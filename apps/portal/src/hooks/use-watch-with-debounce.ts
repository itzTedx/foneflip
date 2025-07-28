import { FieldValues, UseFormReturn } from "@ziron/ui/form";
import { useDebounce } from "@ziron/ui/hooks/use-debounce";
import { useEffect, useState } from "react";

/**
 * Debounced watcher for react-hook-form's watch method.
 * 
 * @template T - The type of the form values being watched.
 * @param form - The form instance returned from useForm().
 * @param delay - Milliseconds to debounce.
 * @param callback - Callback function to run when debounced values change.
 * @param deps - Optional dependencies for form re-subscription.
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
