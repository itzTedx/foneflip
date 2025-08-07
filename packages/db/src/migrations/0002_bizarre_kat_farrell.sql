ALTER TABLE "invitations" RENAME COLUMN "vendors_id" TO "vendor_id";--> statement-breakpoint
ALTER TABLE "invitations" DROP CONSTRAINT "invitations_vendors_id_vendors_id_fk";
--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;