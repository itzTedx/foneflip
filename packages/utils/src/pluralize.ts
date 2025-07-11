/**
 * Returns the plural form of a word based on the count.
 * Handles basic English pluralization rules and allows for a custom plural form.
 * @param word - The word to pluralize
 * @param count - The count to determine singular or plural
 * @param pluralForm - Optional custom plural form
 * @returns The correct singular or plural form based on the count
 *
 * @example
 * pluralize('cat', 1) // 'cat'
 * pluralize('cat', 2) // 'cats'
 * pluralize('child', 2, 'children') // 'children'
 */
export function pluralize(
  word: string,
  count: number,
  pluralForm?: string,
): string {
  if (count === 1) return word;
  if (pluralForm) return pluralForm;

  // Basic English pluralization rules
  if (word.endsWith("y") && !/[aeiou]y$/i.test(word)) {
    return word.slice(0, -1) + "ies";
  } else if (
    word.endsWith("s") ||
    word.endsWith("x") ||
    word.endsWith("z") ||
    word.endsWith("ch") ||
    word.endsWith("sh")
  ) {
    return word + "es";
  } else {
    return word + "s";
  }
}
