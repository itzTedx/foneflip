import { z } from "zod/v4";

export const organizationSchema = z.object({
  userId: z.string(),
  name: z.string().min(2, "Full name must be at least 2 characters"),
  logo: z.string().optional(),
  category: z.enum(["Retailer", "Wholesaler", "Reseller"], { error: "Please select a business category" }),
  website: z.string().optional(),
});

export type OrganizationFormData = z.infer<typeof organizationSchema>;
