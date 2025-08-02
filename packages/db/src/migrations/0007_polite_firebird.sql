DROP INDEX "idx_vendor_invitations_sent_by_admin_id";--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "token" text NOT NULL;--> statement-breakpoint
ALTER TABLE "vendor_invitations" ADD COLUMN "status" "invitation_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
CREATE INDEX "invitations_token_idx" ON "invitations" USING btree ("token");--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_token_unique" UNIQUE("token");