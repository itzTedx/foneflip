-- Update existing invitations to have correct status based on timestamp fields
UPDATE vendor_invitations 
SET status = CASE 
  WHEN revoked_at IS NOT NULL THEN 'revoked'
  WHEN used_at IS NOT NULL THEN 'accepted'
  WHEN expires_at IS NOT NULL AND expires_at < NOW() THEN 'expired'
  ELSE 'pending'
END
WHERE status = 'pending'; 