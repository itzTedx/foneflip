CREATE TABLE "customer_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"vendor_id" uuid,
	"activity_type" varchar(50) NOT NULL,
	"activity_date" timestamp with time zone NOT NULL,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "daily_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"orders" integer DEFAULT 0,
	"revenue" numeric(10, 2) DEFAULT '0',
	"customers" integer DEFAULT 0,
	"response_time" integer DEFAULT 0,
	"products_sold" integer DEFAULT 0,
	"average_order_value" numeric(10, 2) DEFAULT '0',
	"vendor_id" uuid,
	"user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" varchar(50) NOT NULL,
	"customer_id" uuid,
	"vendor_id" uuid,
	"status" varchar(20) DEFAULT 'pending',
	"total_amount" numeric(10, 2) NOT NULL,
	"items_count" integer DEFAULT 0,
	"order_date" timestamp with time zone NOT NULL,
	"response_time" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "todo" (
	"id" serial PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customer_activity" ADD CONSTRAINT "customer_activity_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_activity" ADD CONSTRAINT "customer_activity_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_metrics" ADD CONSTRAINT "daily_metrics_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_metrics" ADD CONSTRAINT "daily_metrics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "customer_activity_user_id_idx" ON "customer_activity" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "customer_activity_vendor_id_idx" ON "customer_activity" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "customer_activity_date_idx" ON "customer_activity" USING btree ("activity_date");--> statement-breakpoint
CREATE INDEX "daily_metrics_date_idx" ON "daily_metrics" USING btree ("date");--> statement-breakpoint
CREATE INDEX "daily_metrics_vendor_id_idx" ON "daily_metrics" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "daily_metrics_user_id_idx" ON "daily_metrics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "order_items_order_id_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_product_id_idx" ON "order_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "orders_order_number_idx" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "orders_customer_id_idx" ON "orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "orders_vendor_id_idx" ON "orders" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "orders_order_date_idx" ON "orders" USING btree ("order_date");