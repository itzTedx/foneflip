import { z } from "zod/v4";

export const productConditionEnum = z.enum([
  "pristine",
  "excellent",
  "good",
  "new",
]);

export const productStatusEnum = z.enum(["active", "draft", "archived"]);
