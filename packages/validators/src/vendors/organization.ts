import { z } from "zod/v4";

export const organizationSchema = z.object({
  userId: z.string(),
  name: z.string().min(2, "Full name must be at least 2 characters"),
  logo: z.string().optional(),
  category: z.enum(["Retailer", "Wholesaler", "Reseller"], { error: "Please select a business category" }),
  website: z.string().optional(),
});

export type OrganizationFormData = z.infer<typeof organizationSchema>;

export const documentsSchema = z.object({
  tradeLicense: z
    .object({
      url: z.string().url("Trade license must be a valid URL"),
      type: z.string(),
    })
    .optional(),
  emiratesIdFront: z
    .object({
      url: z.string().url("Emirates ID front must be a valid URL"),
      type: z.string(),
    })
    .optional(),
  emiratesIdBack: z
    .object({
      url: z.string().url("Emirates ID back must be a valid URL"),
      type: z.string(),
    })
    .optional(),
});

export type DocumentsFormData = z.infer<typeof documentsSchema>;
