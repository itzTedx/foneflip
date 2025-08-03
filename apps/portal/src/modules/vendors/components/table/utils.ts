import { formatDate } from "@ziron/utils";

export function getTimeUntilExpiry(expiresAt?: Date | null): string {
  if (!expiresAt) return "No expiration"; // For used invitations
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();
  if (diff <= 0) return formatDate(expiry, { includeTime: true });
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  return `${hours}h ${minutes}m`;
}

export function getInvitationStatus({
  revokedAt,
  usedAt,
  expiresAt,
}: {
  revokedAt: Date | null;
  usedAt: Date | null;
  expiresAt: Date | null;
}): "Pending" | "Active" | "Expired" | "Revoked" {
  if (revokedAt) return "Revoked";
  if (usedAt) return "Active";
  if (!expiresAt) return "Pending"; // Handle null expiresAt
  const expiresAtDate = new Date(expiresAt);
  if (new Date() > expiresAtDate) return "Expired";
  return "Pending";
}
