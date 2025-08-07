import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { users } from "./auth-schema";
import { baseSchema } from "./base-schema";

// Organization roles enum
export const organizationRolesEnum = pgEnum("organization_roles", ["owner", "admin", "member"]);

// Invitation status enum
export const invitationStatusEnum = pgEnum("invitation_status", [
  "pending",
  "accepted",
  "expired",
  "revoked",
  "onboarding",
]);

// Vendor status enum
export const vendorStatusEnum = pgEnum("vendor_status", [
  "onboarding", // Vendor started the onboarding process
  "pending_approval", // Vendor completed onboarding, waiting for admin approval
  "approved", // Admin approved the vendor
  "rejected", // Admin rejected the vendor
  "suspended", // Admin suspended the vendor
  "active", // Vendor is fully active and can list products
]);

// Document types enum for vendors
export const vendorDocumentTypeEnum = pgEnum("vendor_document_type", [
  "trade_license",
  "emirates_id_front",
  "emirates_id_back",
  "signature_stamp",
]);

// Document format enum for vendors
export const vendorDocumentFormatEnum = pgEnum("vendor_document_format", ["pdf", "jpg", "png"]);

// Vendors table
export const vendors = pgTable(
  "vendors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessName: varchar("business_name", { length: 100 }),
    vendorEmail: varchar("vendor_email", { length: 255 }),
    slug: text("slug").notNull().unique(),
    logo: varchar("logo", { length: 255 }),
    description: text("description"),
    website: varchar("website", { length: 255 }),
    businessCategory: varchar("business_category", { length: 100 }),

    vendorName: varchar("vendor_name", { length: 255 }),
    vendorNumber: varchar("vendor_number", { length: 20 }),
    vendorWhatsappNumber: varchar("vendor_whatsapp_number", { length: 20 }),
    vendorPosition: varchar("vendor_position", { length: 50 }),

    monthlyEstimatedSales: integer("monthly_estimated_sales"),
    tradeLicenseNumber: varchar("trade_license_number", { length: 20 }),

    supportEmail: varchar("support_email", { length: 255 }),
    supportPhone: varchar("support_phone", { length: 20 }),
    operatingHours: text("operating_hours"),
    terms: text("terms"),

    status: vendorStatusEnum("status").default("onboarding").notNull(),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    approvedBy: uuid("approved_by").references(() => users.id, {
      onDelete: "set null",
    }),
    rejectionReason: text("rejection_reason"),

    metadata: jsonb("metadata"), // JSON string for additional metadata
    ...baseSchema,
  },
  (table) => [
    uniqueIndex("idx_vendors_slug").on(table.slug),
    index("idx_vendors_business_name").on(table.businessName),
    index("idx_vendors_status").on(table.status),
  ]
);

// Vendor Documents table
export const vendorDocumentsTable = pgTable(
  "vendor_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "cascade" }),
    documentType: vendorDocumentTypeEnum("document_type").notNull(),
    documentFormat: vendorDocumentFormatEnum("document_format").notNull(),
    url: varchar("url", { length: 255 }).notNull(),
    ...baseSchema,
  },
  (table) => [
    index("idx_vendor_documents_vendor_id").on(table.vendorId),
    index("idx_vendor_documents_document_type").on(table.documentType),
    index("idx_vendor_documents_document_format").on(table.documentFormat),
  ]
);

// Member table - links users to vendors
export const members = pgTable(
  "members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: organizationRolesEnum("role").notNull().default("member"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_member_user_vendor").on(table.userId, table.vendorId),
    index("idx_member_user_id").on(table.userId),
    index("idx_member_vendor_id").on(table.vendorId),
    index("idx_member_role").on(table.role),
  ]
);

// Legacy vendor invitations table (keeping for backward compatibility)
export const vendorInvitations = pgTable(
  "vendor_invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vendorEmail: varchar("vendor_email", { length: 255 }).notNull(),
    vendorName: varchar("vendor_name", { length: 69 }).notNull().default(""),
    token: varchar("invitation_token", { length: 128 }).notNull().unique(),
    sentByAdminId: uuid("sent_by_admin_id").references(() => users.id, {
      onDelete: "set null",
    }),
    invitationType: varchar("invitation_type", { length: 50 }).notNull().default("onboarding"),
    status: invitationStatusEnum("status").default("pending").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    usedAt: timestamp("used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ...baseSchema,
  },
  (table) => [
    index("idx_vendor_invitations_vendor_email").on(table.vendorEmail),
    uniqueIndex("idx_vendor_invitations_token").on(table.token),
    index("idx_vendor_invitations_expires_at").on(table.expiresAt),

    index("idx_vendor_invitations_deleted_at").on(table.deletedAt),
  ]
);

// Relations
export const vendorsRelations = relations(vendors, ({ many }) => ({
  members: many(members),
  documents: many(vendorDocumentsTable),
}));

export const memberRelations = relations(members, ({ one }) => ({
  user: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),
  vendor: one(vendors, {
    fields: [members.vendorId],
    references: [vendors.id],
  }),
}));

export const vendorDocumentsRelations = relations(vendorDocumentsTable, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorDocumentsTable.vendorId],
    references: [vendors.id],
  }),
}));

export const vendorInvitationsRelations = relations(vendorInvitations, ({ one }) => ({
  sentByAdmin: one(users, {
    fields: [vendorInvitations.sentByAdminId],
    references: [users.id],
  }),
}));
