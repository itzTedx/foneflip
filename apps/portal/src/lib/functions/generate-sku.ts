export const generateSKU = (
  brand: string,
  model: string,
  condition: string,
  storage?: string,
  color?: string,
  existingVariants?: Array<{ sku?: string }>,
  currentSku?: string
) => {
  // Clean and format input strings
  const cleanString = (str: string) => {
    return str
      ? str
          .trim()
          .replace(/[^a-zA-Z0-9]/g, "")
          .toUpperCase()
      : "";
  };

  // Get codes with minimum length handling
  const getCode = (str: string | undefined, minLength: number) => {
    const cleaned = cleanString(str || "");
    return cleaned.length >= minLength
      ? cleaned.slice(0, minLength)
      : cleaned.padEnd(minLength, "X");
  };

  // Format storage (e.g., "128GB" -> "128")
  const formatStorage = (storage?: string) => {
    if (!storage) return "000";
    const match = storage.match(/(\d+)/);
    return match ? match[1] : "000";
  };

  // Format condition code
  const getConditionCode = (condition: string) => {
    const conditionMap: Record<string, string> = {
      pristine: "P",
      excellent: "E",
      good: "G",
      new: "N",
    };
    return conditionMap[condition] || "U";
  };

  // Custom model code logic for models with numbers (e.g., 'iPhone 16 Pro Max' -> 'IP16PM')
  const getModelCode = (model: string) => {
    const words = model.trim().split(/\s+/);
    const numberMatch = model.match(/\d+/);
    if (numberMatch && words.length > 1) {
      // Get first two letters of the first word
      const firstWord = words[0];
      if (!firstWord) return getCode(model, 4);

      const firstTwo = cleanString(firstWord).slice(0, 2);
      // Get the number
      const number = numberMatch[0];
      // Get the first letter of each remaining word (excluding the number)
      const rest = words
        .slice(1)
        .filter((w) => !/\d+/.test(w))
        .map((w) => cleanString(w).charAt(0))
        .join("");
      return `${firstTwo}${number}${rest}`.toUpperCase();
    }
    // Fallback to previous logic
    return getCode(model, 4);
  };

  const brandCode = getCode(brand, 3);
  const modelCode = getModelCode(model);
  const storageCode = formatStorage(storage);
  const colorCode = getCode(color, 2);
  const conditionCode = getConditionCode(condition);

  // Dynamically build baseSKU based on provided values
  let baseSKU = `${brandCode}-${modelCode}`;
  if (storage) {
    baseSKU += `-${storageCode}`;
  }
  if (color) {
    baseSKU += `-${colorCode}`;
  }
  baseSKU += `-${conditionCode}`;

  // If existingVariants is not provided, return the baseSKU directly
  if (!existingVariants) {
    return baseSKU;
  }

  // Exclude the current SKU from the list of existing SKUs for duplication check
  const existingSKUs = existingVariants
    .map((v) => v.sku)
    .filter((sku): sku is string => sku !== undefined && sku !== currentSku);

  let finalSKU = baseSKU;
  let counter = 1;

  while (existingSKUs.includes(finalSKU)) {
    finalSKU = `${baseSKU}-${counter.toString().padStart(2, "0")}`;
    counter++;
  }

  return finalSKU;
};
