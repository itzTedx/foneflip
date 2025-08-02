"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { Button } from "@ziron/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useForm, zodResolver } from "@ziron/ui/form";
import { Input } from "@ziron/ui/input";
import { LoadingSwap } from "@ziron/ui/loading-swap";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ziron/ui/select";
import { OrganizationFormData, organizationSchema } from "@ziron/validators";

import { InfoTooltip } from "@/components/ui/tooltip";

import { createOrganization } from "../../actions/mutation";

interface Props {
  userId: string;
}

export const OrganizationForm = ({ userId }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      userId,
      category: undefined,
      logo: undefined,
      name: "",
      website: "",
    },
  });

  function onSubmit(data: OrganizationFormData) {
    startTransition(async () => {
      const result = await createOrganization(data);

      if (!result.success) {
        toast.error(result.message);
      } else {
        toast.success(result.message);
        router.push("/vendor/onboarding/documents");
      }
    });
  }

  return (
    <Form {...form}>
      <form className="mt-8 flex w-full flex-col items-center space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Business Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Business Category</FormLabel>
              <Select defaultValue={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Business Category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Retailer">Retailer</SelectItem>
                  <SelectItem value="Wholesaler">Wholesaler</SelectItem>
                  <SelectItem value="Reseller">Reseller</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>
                Website <InfoTooltip info="Enter your business website" />
              </FormLabel>
              <FormControl>
                <Input placeholder="https://yourwebsite.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full" disabled={isPending} type="submit">
          <LoadingSwap isLoading={isPending}>Continue</LoadingSwap>
        </Button>
      </form>
    </Form>
  );
};
