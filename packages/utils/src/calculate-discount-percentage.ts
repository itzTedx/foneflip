/**
 * Calculates the discount percentage between compare price and final price
 * @param originalPrice - The original/compare price
 * @param sellingPrice - The final/sale price
 * @returns The discount percentage as a string with % symbol
 */
export const calculateDiscountPercentage = (original: string, selling: string): string => {
  const comparePrice = Number(original);
  const finalPrice = Number(selling);

  if (comparePrice <= 0 || finalPrice <= 0) return "0%";
  if (finalPrice >= comparePrice) return "0%";

  const discount = ((comparePrice - finalPrice) / comparePrice) * 100;
  return `${Math.round(discount)}%`;
};
