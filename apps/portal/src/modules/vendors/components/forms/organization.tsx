"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { Button } from "@ziron/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useForm, zodResolver } from "@ziron/ui/form";
import { Input } from "@ziron/ui/input";
import { LoadingSwap } from "@ziron/ui/loading-swap";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ziron/ui/select";
import { OrganizationFormData, organizationSchema } from "@ziron/validators";

import { InfoTooltip } from "@/components/ui/tooltip";
import { useVendorStorage } from "@/hooks/use-vendor-storage";
import { useSession } from "@/lib/auth/client";
import { useOnboarding } from "@/modules/onboarding";

import { createOrganization } from "../../actions/mutation";

interface Props {
  userId: string;
}

export const OrganizationForm = ({ userId }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();
  const { vendorData, saveData, isLoading: isStorageLoading } = useVendorStorage(userId);
  const { saveData: saveOnboardingData, isLoading: isOnboardingLoading } = useOnboarding(userId);

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

  // Load existing vendor data from IndexedDB on component mount
  useEffect(() => {
    if (vendorData) {
      form.reset({
        userId,
        category: vendorData.category,
        logo: vendorData.logoUrl,
        name: vendorData.organizationName,
        website: vendorData.website || "",
      });
    }
  }, [vendorData, form]);

  function onSubmit(data: OrganizationFormData) {
    startTransition(async () => {
      try {
        // Save to vendor storage
        await saveData({
          userId,
          username: session?.user?.name,
          email: session?.user?.email,
          organizationName: data.name,
          category: data.category,
          logoUrl: data.logo,
          website: data.website,
        });

        // Save to onboarding data
        await saveOnboardingData({
          organization: {
            name: data.name,
            category: data.category!,
            website: data.website,
            logoUrl: data.logo,
          },
        });

        // Submit to server
        const result = await createOrganization(data);

        if (!result.success) {
          toast.error(result.message);
        } else {
          toast.success(result.message);
          router.push("/onboarding/organization/documents");
        }
      } catch (error) {
        console.error("Failed to save vendor data:", error);
        if (error instanceof Error) {
          toast.error(`Failed to save vendor data: ${error.message}`);
        } else {
          toast.error("Failed to save vendor data. Please try again.");
        }
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
              <Select defaultValue="Retailer" onValueChange={field.onChange} value={field.value}>
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

        <Button className="w-full" disabled={isPending || isStorageLoading || isOnboardingLoading} type="submit">
          <LoadingSwap isLoading={isPending || isStorageLoading || isOnboardingLoading}>Continue</LoadingSwap>
        </Button>
      </form>
    </Form>
  );
};
