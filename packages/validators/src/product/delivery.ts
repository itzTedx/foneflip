import z from "zod/v4";

export const deliverySchema = z
  .object({
    packageSize: z.string("Package size must be a valid text.").nullish(),
    weight: z.string("Weight must be a valid text.").nullish(),
    cod: z.boolean().default(false),
    returnable: z.boolean().default(false),
    returnPeriod: z.string("Return period must be a valid text.").nullish(),
    type: z
      .object({
        express: z.boolean().default(false),
        fees: z.string({ error: "Delivery fees must be a valid text." }).optional(),
      })
      .refine(
        (type) => {
          if (type.express) {
            return !!type.fees && type.fees.trim() !== "";
          }
          return true;
        },
        {
          message: "Delivery fee is required when express delivery is enabled.",
          path: ["fees"],
        }
      ),
  })
  .refine(
    (delivery) => {
      if (delivery.returnable) {
        return !!delivery.returnPeriod && delivery.returnPeriod.trim() !== "";
      }
      return true;
    },
    {
      message: "Return period is required when the product is returnable.",
      path: ["returnPeriod"],
    }
  );
