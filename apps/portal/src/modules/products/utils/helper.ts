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
   
        images: [{
            file: {
                url: "",
                key: "",
                name: "",
                size: 0
            },
            metadata: {
                blurData: "",
                height: 0,
                width: 0
            },
            alt: "",
            id: "",
            isPrimary: false,
        }],

        attributes: [],

        variants: [],

        specifications: [],

        delivery: {
            weight: undefined,
            packageSize: undefined,
            cod: false,
            returnPeriod: undefined,
            returnable: false,   
            type: {
                express: false,
                fees:"30"
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
