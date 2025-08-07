ALTER TABLE "member" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "member" CASCADE;--> statement-breakpoint
ALTER TABLE "members" RENAME COLUMN "vendors_id" TO "vendor_id";--> statement-breakpoint
ALTER TABLE "members" DROP CONSTRAINT "members_vendors_id_vendors_id_fk";
--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "role" SET DEFAULT 'member'::"public"."organization_roles";--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "role" SET DATA TYPE "public"."organization_roles" USING "role"::"public"."organization_roles";--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_member_user_vendor" ON "members" USING btree ("user_id","vendor_id");--> statement-breakpoint
CREATE INDEX "idx_member_user_id" ON "members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_member_vendor_id" ON "members" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "idx_member_role" ON "members" USING btree ("role");