import { ProductVariant } from "../types";

export const getPriceRange = (variants: ProductVariant[], priceType: "sellingPrice" | "originalPrice") => {
  if (!variants || variants.length === 0) {
    return null;
  }
  const prices = variants
    .map((v) => v[priceType])
    .filter((p): p is string => p !== null && p !== undefined)
    .map(Number.parseFloat)
    .filter((p) => !isNaN(p));
  if (prices.length === 0) {
    return null;
  }
  if (prices.length === 1) {
    return { from: prices[0] };
  }
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  if (minPrice === maxPrice) {
    return { from: minPrice };
  }
  return { from: minPrice, to: maxPrice };
};
