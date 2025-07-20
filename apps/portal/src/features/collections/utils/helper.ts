import { CollectionFormType } from "@ziron/validators";

// Helper to get default values
export const getDefaultValues = (): CollectionFormType => {
  return {
    title: "",
    description: "",
    label: "",
    sortOrder: 0,
    slug: "",
    thumbnail: undefined,
    banner: undefined,
    meta: {
      title: "",
      description: "",
      keywords: "",
    },
    settings: {
      status: "active",
      isFeatured: false,
      layout: "grid",
      showLabel: true,
      showBanner: false,
      showInNav: true,
      tags: [],
      internalNotes: "",
      customCTA: "",
    },
  };
};
