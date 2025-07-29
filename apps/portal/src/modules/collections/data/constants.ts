import type { JSX, SVGProps } from "react";

import {
  IconGlobalFilled,
  IconImageFilled,
  IconInformationFilled,
  IconShoppingBasketFilled,
} from "@ziron/ui/assets/icons";

export type TabTriggerType = {
  value: string;
  label: string;
  Icon: (
    props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
  ) => JSX.Element;
};

export const COLLECTION_TABS = [
  { value: "details", label: "General Info", Icon: IconInformationFilled },
  { value: "media", label: "Media", Icon: IconImageFilled },
  { value: "products", label: "Products", Icon: IconShoppingBasketFilled },
  { value: "seo", label: "SEO & Meta", Icon: IconGlobalFilled },
] as const;
