"use client";

import { useForm, zodResolver } from "@ziron/ui/components/form";
import { CollectionFormType, collectionSchema } from "@ziron/validators";

import { validateForm } from "../utils/validation";

export const CollectionForm = () => {
  const form = useForm<CollectionFormType>({
    resolver: zodResolver(collectionSchema),
  });

  const data = form.watch();
  const validation = validateForm(data, collectionSchema);

  console.info("validate form data: ", validation);
  return <div>CollectionForm</div>;
};
