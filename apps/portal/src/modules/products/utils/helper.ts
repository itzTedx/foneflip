import { asc } from "drizzle-orm";

import { productImagesTable } from "@ziron/db/schema";
import { MediaFormType, ProductFormType } from "@ziron/validators";

import { Media } from "@/modules/collections/types";

import { ProductQueryResult } from "../types";

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

/**
 * Standard product relations for consistent data fetching
 */
export const getProductRelations = () => ({
  images: {
    columns: { isFeatured: true },
    with: {
      media: {
        columns: { id: true, url: true, blurData: true, alt: true },
      },
    },
    limit: 1,
    orderBy: asc(productImagesTable.sortOrder),
  },
  // seo: {
  //   columns: {
  //     metaTitle: true,
  //     metaDescription: true,
  //     keywords: true,
  //   },
  // },
  // specifications: {
  //   columns: {
  //     name: true,
  //     value: true,
  //   },
  // },
  settings: {
    columns: {
      status: true,
      visible: true,
      tags: true,
      featured: true,
    },
  },
  delivery: {
    columns: {
      expressDelivery: true,
    },
  },
  // attributes: {
  //   with: {
  //     options: {
  //       columns: {
  //         value: true,
  //       },
  //     },
  //   },
  // },
  variants: {
    columns: {
      sku: true,
      stock: true,
      sellingPrice: true,
      originalPrice: true,
      isDefault: true,
    },
    with: {
      options: {
        columns: {},
        with: {
          option: {
            columns: { value: true },
            with: { attribute: { columns: { name: true } } },
          },
        },
      },
    },
  },
  collection: { columns: { id: true, title: true, slug: true } },

  vendor: {
    columns: {
      slug: true,
      businessName: true,
    },
  },
});

/**
 * Full product relations for detailed views
 */
export const getFullProductRelations = () => ({
  images: {
    with: {
      media: {
        columns: {
          id: true,
          url: true,
          blurData: true,
          alt: true,
        },
      },
    },
  },
  seo: {
    columns: {
      metaTitle: true,
      metaDescription: true,
      keywords: true,
    },
  },
  specifications: {
    columns: {
      name: true,
      value: true,
    },
  },
  settings: {
    columns: {
      status: true,
      visible: true,
      tags: true,
      featured: true,
      allowReviews: true,
      allowBackorders: true,
      showStockStatus: true,
      hidePrice: true,
      customCTA: true,
    },
  },
  delivery: {
    columns: {
      weight: true,
      packageSize: true,
      cod: true,
      returnable: true,
      returnablePeriod: true,
      expressDelivery: true,
      deliveryFees: true,
    },
  },
  attributes: {
    with: {
      options: {
        columns: {
          value: true,
        },
      },
    },
  },
  variants: {
    with: {
      options: {
        with: {
          option: {
            with: {
              attribute: {
                columns: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  },
  collection: { columns: { id: true, title: true, slug: true } },
  user: {
    columns: { name: true },
  },
});

/**
 * Converts a product database object into a structure suitable for form initialization.
 *
 * Returns `null` if the input is `false`. Maps product fields and associated media into the form type, including metadata and settings.
 *
 * @param product - The product object to transform, or `false` if not available
 * @returns The form-compatible product data with `updatedAt`, or `null` if input is `false`
 */
export function transformProductToFormType(
  product: false | ProductQueryResult
): (ProductFormType & { updatedAt: Date }) | null {
  if (!product) return null;

  /**
   * Converts a Media object to a MediaFormType suitable for form usage, or returns undefined if the media or its URL is missing.
   *
   * Maps media properties such as URL, file name, size, dimensions, blur data, and alt text to the form structure.
   *
   * @param media - The media object to convert
   * @returns The converted MediaFormType, or undefined if input is invalid
   */
  function toFormMedia(media?: Media): MediaFormType | undefined {
    if (!media || !media.url) return undefined; // url is required
    return {
      file: {
        url: media.url,
        name: media.fileName ?? undefined,
        size: media.fileSize ?? undefined,
      },
      metadata: {
        width: media.width ?? undefined,
        height: media.height ?? undefined,
        blurData: media.blurData ?? undefined,
      },
      alt: media.alt ?? undefined,
    };
  }

  return {
    ...product,
    id: product.id ?? undefined,
    description: product.description || "",
    brand: product.brand ?? "",
    collectionId: product.collectionId ?? "",
    vendorId: product.vendorId ?? "",
    attributes: [],

    variants: [],

    specifications: [],

    hasVariant: product.hasVariant ?? false,
    sku: product.sku ?? "",
    slug: product.slug ?? "",
    price: {
      selling: product.sellingPrice ?? undefined,
      original: product.originalPrice ?? undefined,
    },
    meta: {
      title: product.seo?.metaTitle || undefined,
      description: product.seo?.metaDescription || undefined,
      keywords: product.seo?.keywords || undefined,
    },

    settings: {
      ...product.settings,
      status: product.settings?.status ?? "draft",
    },
    updatedAt: product.updatedAt,
  };
}
