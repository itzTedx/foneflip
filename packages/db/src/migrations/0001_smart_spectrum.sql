ALTER TABLE "members" RENAME COLUMN "vendors_id" TO "vendor_id";--> statement-breakpoint
ALTER TABLE "members" DROP CONSTRAINT "members_vendors_id_vendors_id_fk";
--> statement-breakpoint
DROP INDEX "idx_member_user_vendor";--> statement-breakpoint
DROP INDEX "idx_member_vendor_id";--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_member_user_vendor" ON "members" USING btree ("user_id","vendor_id");--> statement-breakpoint
CREATE INDEX "idx_member_vendor_id" ON "members" USING btree ("vendor_id");