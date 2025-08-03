/**
 * Formats a UAE mobile phone number to a standard format.
 * e.g., +971 5X XXX XXXX
 * It handles numbers with or without country code (+971), with or without leading zero.
 * If the number is not a valid UAE mobile format, it returns the original string.
 *
 * @param phoneNumber The phone number to format.
 * @returns The formatted phone number or the original string.
 */
export const formatPhoneNumber = (phoneNumber: string | null | undefined): string => {
  if (!phoneNumber) {
    return "-";
  }

  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, "");

  // Handle numbers with country code
  if (cleaned.startsWith("971")) {
    cleaned = cleaned.substring(3);
  }

  // Handle numbers with leading zero
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }

  // A valid UAE mobile number (without country code and leading 0) is 9 digits long
  // and starts with a 5 (e.g., 50, 52, 54, 55, 56, 58).
  if (cleaned.length === 9 && cleaned.startsWith("5")) {
    const operatorCode = cleaned.substring(0, 2);
    const part1 = cleaned.substring(2, 5);
    const part2 = cleaned.substring(5);
    return `+971 ${operatorCode} ${part1} ${part2}`;
  }

  // If it doesn't match the mobile format, return the original number.
  // This allows for other number types (e.g., landlines, international) to be displayed as is.
  return phoneNumber;
};
