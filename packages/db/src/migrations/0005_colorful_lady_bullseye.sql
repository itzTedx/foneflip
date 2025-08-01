DROP INDEX "products_brand_idx";--> statement-breakpoint
DROP INDEX "products_condition_idx";--> statement-breakpoint
ALTER TABLE "product_deliveries" ALTER COLUMN "weight" SET DATA TYPE varchar;