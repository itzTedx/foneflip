import {
  IconGlobalFilled,
  IconImageFilled,
  IconInformationFilled,
  IconListCheck,
  IconStackFilled,
} from "@ziron/ui/assets/icons";

export const PRODUCTS_TABS = [
  { value: "info", label: "Product Info", Icon: IconInformationFilled },
  { value: "media", label: "Media", Icon: IconImageFilled },
  { value: "variants", label: "Variants", Icon: IconStackFilled },
  { value: "specifications", label: "Specifications", Icon: IconListCheck },
  { value: "seo", label: "SEO & Meta", Icon: IconGlobalFilled },
] as const;

export const ATTRIBUTE_TYPES = {
  COLOR: ["color", "colour", "shade", "hue"],
  STORAGE: ["storage", "capacity", "memory", "size"],
} as const;

// Attribute name to default suggestions mapping
export const ATTRIBUTE_SUGGESTIONS: Record<string, string[]> = {
  color: ["Black", "White", "Blue", "Red", "Green", "Gold", "Silver", "Gray"],
  storage: ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB", "2TB"],
  size: ["Small", "Medium", "Large", "XL", "XXL"],
  material: ["Plastic", "Metal", "Glass", "Ceramic", "Leather"],
  // Add more as needed
} as const;
