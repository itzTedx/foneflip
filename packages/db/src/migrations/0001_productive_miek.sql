DROP INDEX "collections_slug_idx";--> statement-breakpoint
ALTER TABLE "collection_settings" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "collection_settings" ALTER COLUMN "layout" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "collection_settings" ALTER COLUMN "show_label" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "collection_settings" ALTER COLUMN "show_banner" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "collection_settings" ALTER COLUMN "tags" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "collection_settings" ALTER COLUMN "tags" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "collection_settings" ALTER COLUMN "internal_notes" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "collection_settings" ALTER COLUMN "internal_notes" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "collection_settings" ALTER COLUMN "custom_cta" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "collection_settings" ALTER COLUMN "custom_cta" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "collections_slug_idx" ON "collections" USING btree ("slug");