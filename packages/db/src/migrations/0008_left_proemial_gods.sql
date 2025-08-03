ALTER TABLE "vendors" RENAME COLUMN "vendor_email" TO "name";--> statement-breakpoint
ALTER TABLE "vendors" RENAME COLUMN "business_category" TO "category";--> statement-breakpoint
ALTER TABLE "vendors" RENAME COLUMN "vendor_number" TO "number";--> statement-breakpoint
ALTER TABLE "vendors" RENAME COLUMN "vendor_whatsapp_number" TO "whatsapp_number";--> statement-breakpoint
ALTER TABLE "vendors" RENAME COLUMN "vendor_position" TO "position";--> statement-breakpoint
DROP INDEX "idx_vendors_name";--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "vendor_name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "vendor_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "email" varchar(255);--> statement-breakpoint
CREATE INDEX "idx_vendors_name" ON "vendors" USING btree ("name");--> statement-breakpoint
ALTER TABLE "vendors" DROP COLUMN "business_name";