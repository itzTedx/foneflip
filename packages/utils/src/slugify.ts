/**
 * Options for the slugify function
 */
interface SlugifyOptions {
  /** Character to use as separator (default: '-') */
  separator?: string;
  /** Whether to convert to lowercase (default: true) */
  lowercase?: boolean;
  /** Whether to remove special characters (default: true) */
  removeSpecialChars?: boolean;
  /** Maximum length of the slug (default: undefined - no limit) */
  maxLength?: number;
  /** Custom character mappings for specific characters */
  charMap?: Record<string, string>;
}

/**
 * Creates a URL-friendly slug from a string
 * @param str - The string to convert to a slug
 * @param options - Configuration options for the slugify function
 * @returns A URL-friendly slug
 *
 * @example
 * slugify("Hello World!") // "hello-world"
 * slugify("Hello World!", { separator: '_' }) // "hello_world"
 * slugify("Hello World!", { maxLength: 5 }) // "hello"
 */
export function slugify(str: string, options: SlugifyOptions = {}): string {
  const {
    separator = "-",
    lowercase = true,
    removeSpecialChars = true,
    maxLength,
    charMap = {
      æ: "ae",
      œ: "oe",
      å: "a",
      ø: "o",
      ü: "u",
      ñ: "n",
      ç: "c",
      ß: "ss",
      é: "e",
      è: "e",
      ê: "e",
      ë: "e",
      à: "a",
      á: "a",
      â: "a",
      ã: "a",
      ä: "a",
      í: "i",
      ì: "i",
      î: "i",
      ï: "i",
      ó: "o",
      ò: "o",
      ô: "o",
      õ: "o",
      ö: "o",
      ú: "u",
      ù: "u",
      û: "u",
      ý: "y",
      ÿ: "y",
    },
  } = options;

  if (!str) return "";

  let result = str;

  // Apply custom character mappings
  Object.entries(charMap).forEach(([char, replacement]) => {
    result = result.replace(new RegExp(char, "gi"), replacement);
  });

  // Convert to lowercase if specified
  if (lowercase) {
    result = result.toLowerCase();
  }

  // Remove special characters if specified
  if (removeSpecialChars) {
    // Replace any non-alphanumeric characters with the separator
    result = result.replace(/[^a-z0-9]+/gi, separator);
  }

  // Remove leading/trailing separators
  result = result.replace(new RegExp(`^${separator}+|${separator}+$`, "g"), "");

  // Replace multiple consecutive separators with a single one
  result = result.replace(new RegExp(`${separator}+`, "g"), separator);

  // Apply max length if specified
  if (maxLength && result.length > maxLength) {
    result = result.substring(0, maxLength);
    // Remove trailing separator if it exists after truncation
    result = result.replace(new RegExp(`${separator}+$`, "g"), "");
  }

  return result;
}
