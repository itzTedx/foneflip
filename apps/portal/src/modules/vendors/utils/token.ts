import { randomBytes } from "crypto";

/**
 * Generate a secure token for vendor invitations
 * - Uses cryptographically secure random bytes
 * - URL-safe format
 * - 32 characters long
 */
export function generateInvitationToken(): string {
  // Generate 16 bytes (128 bits) of random data
  const randomData = randomBytes(16);

  // Convert to base64 and make URL-safe
  const token = randomData.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  return token;
}
