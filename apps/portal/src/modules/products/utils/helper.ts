import { ProductFormType } from "@ziron/validators";

// Helper to get default values
export const productFormDefaultValues: ProductFormType = {
  title: "",
  description: "",
  collectionId: "",
  brand: "",
  condition: "new",
  slug: undefined,
  vendorId: "",
  hasVariant: false,
  price: {
    selling: undefined,
    original: undefined,
  },
  sku: "",
  stock: 0,

  images: [],

  attributes: [],

  variants: [],

  specifications: [],

  delivery: {
    weight: null,
    packageSize: null,
    cod: false,
    returnPeriod: null,
    returnable: false,
    type: {
      express: false,
      fees: "30",
    },
  },

  meta: {
    title: undefined,
    description: undefined,
    keywords: undefined,
  },

  settings: {
    productId: undefined,
    status: "draft",
    visible: true,
    allowReviews: true,
    allowBackorders: false,
    showStockStatus: false,
    featured: false,
    hidePrice: false,
    customCTA: "Buy now",
    tags: [],
    internalNotes: "",
  },
};
