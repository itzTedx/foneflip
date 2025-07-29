/**
 * Returns the plural form of a word based on the count.
 * Applies basic English pluralization rules or uses a custom plural form if provided.
 *
 * @param word - The word to pluralize
 * @param count - The number determining singular or plural form
 * @param pluralForm - Optional custom plural form
 * @returns The appropriate singular or plural form
 *
 * @example
 * pluralize('cat', 1) // 'cat'
 * pluralize('cat', 2) // 'cats'
 * pluralize('child', 2, 'children') // 'children'
 */
export function pluralize(
  word: string,
  count: number,
  pluralForm?: string
): string {
  if (count === 1) return word;
  if (pluralForm) return pluralForm;

  const lowerWord = word.toLowerCase();

  if (lowerWord.endsWith("y") && !/[aeiou]y$/.test(lowerWord)) {
    return `${word.slice(0, -1)}ies`;
  }

  if (/(s|x|z|ch|sh)$/.test(lowerWord)) {
    return `${word}es`;
  }

  return `${word}s`;
}
