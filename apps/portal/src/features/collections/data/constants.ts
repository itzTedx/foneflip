export type TabsType = {
  value: string;
  label: string;
}[];

export const collectionTabs: TabsType = [
  { value: "details", label: "General Info" },
  { value: "media", label: "Media" },
  { value: "products", label: "Products" },
  { value: "seo", label: "SEO & Meta" },
] as const;
