import { ProductFormType } from "@ziron/validators";

// Helper to get default values
export const getDefaultValues = (): ProductFormType => {
    return {
        title: "",
        description: "",
        collectionId: "",
        brand: "",
        condition: "new",
        slug: "",
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
                fees: "30"
            }
        },

        meta: {
            title: "",
            description: '',
            keywords: ''
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

        }
    }
}
