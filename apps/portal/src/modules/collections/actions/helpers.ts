import { eq } from "drizzle-orm";

import { collectionSettingsTable, collectionsTable, seoTable } from "@ziron/db/schema";
import { db } from "@ziron/db/server";
import redis from "@ziron/redis";
import { slugify } from "@ziron/utils";
import { CollectionDraftFormType, CollectionFormType } from "@ziron/validators";

import type { Collection, CollectionSettings, Seo, UpsertCollectionSettings } from "../types";
import { existingCollection } from "./queries";

// Types for collection operations
export interface CollectionData {
  id?: string;
  title: string;
  description?: string;
  label?: string;
  slug: string;
  sortOrder?: number;
  seoId?: string;
}

export interface CollectionSettingsData {
  collectionId: string;
  status?: "active" | "archived" | "draft";
  isFeatured?: boolean;
  layout?: string;
  showLabel?: boolean;
  showBanner?: boolean;
  showInNav?: boolean;
  tags?: string[];
  internalNotes?: string;
  customCTA?: string;
}

export interface CollectionValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface CollectionPreparationOptions {
  title: string;
  description?: string;
  label?: string;
  slug: string;
  sortOrder?: number;
  seoId?: string;
  id?: string;
}

/**
 * Prepares collection data for database operations
 * @param options - Collection preparation options
 * @returns Prepared collection data
 */
export function prepareCollectionData({
  title,
  description,
  label,
  slug,
  sortOrder,
  seoId,
  id,
}: CollectionPreparationOptions): CollectionData {
  return {
    id,
    title,
    description,
    label,
    slug,
    sortOrder,
    seoId,
  };
}

/**
 * Validates the fields of a collection data object for required presence, length limits, and sort order integrity.
 *
 * @param data - The collection data to validate
 * @returns An object indicating whether the data is valid and an array of error messages if invalid
 */
export function validateCollectionData(data: CollectionData): CollectionValidationResult {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push("Title is required");
  }

  if (data.title && data.title.length > 255) {
    errors.push("Title cannot be longer than 255 characters");
  }

  if (data.description && data.description.length > 1000) {
    errors.push("Description cannot be longer than 1000 characters");
  }

  if (data.label && data.label.length > 100) {
    errors.push("Label cannot be longer than 100 characters");
  }

  if (!data.slug || data.slug.trim().length === 0) {
    errors.push("Slug is required");
  }

  if (data.sortOrder !== undefined && (data.sortOrder < 0 || !Number.isInteger(data.sortOrder))) {
    errors.push("Sort order must be a non-negative integer");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export type Trx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Inserts or updates collection settings for a given collection.
 *
 * If settings for the specified collection ID exist, updates them; otherwise, inserts new settings. Returns the upserted settings or null if the operation fails.
 *
 * @returns The upserted collection settings, or null if the operation did not succeed.
 */
export async function upsertCollectionSettings(
  settingsData: UpsertCollectionSettings,
  trx: Trx
): Promise<CollectionSettings | null> {
  const data = {
    ...settingsData,
    deletedAt: null,
    updatedAt: new Date(),
  };

  // Try update first
  const [existingSettings] = await trx
    .update(collectionSettingsTable)
    .set(data)
    .where(eq(collectionSettingsTable.collectionId, settingsData.collectionId))
    .returning();

  if (!existingSettings) {
    // Insert if not exists
    const [newSettings] = await trx
      .insert(collectionSettingsTable)
      .values({
        ...data,
        createdAt: new Date(),
      })
      .returning();
    return newSettings || null;
  }

  return existingSettings;
}

/**
 * Prepares data for a duplicated collection, appending " (Copy)" to the title, incrementing sort order, and applying a new slug and optional SEO ID.
 *
 * @param originalCollection - The collection to duplicate
 * @param newSlug - The slug to assign to the duplicate
 * @param newSeoId - Optional SEO ID for the duplicate
 * @returns Collection data suitable for creating a duplicate collection
 */
export function prepareDuplicateCollectionData(
  originalCollection: Collection,
  newSlug: string,
  newSeoId?: string
): CollectionData {
  return {
    title: `${originalCollection.title} (Copy)`,
    description: originalCollection.description || undefined,
    label: originalCollection.label || undefined,
    slug: newSlug,
    sortOrder: (originalCollection.sortOrder || 0) + 1,
    seoId: newSeoId,
  };
}

/**
 * Prepares duplicated collection settings data for a new collection.
 *
 * Sets the status to "draft" and copies all other settings from the original collection settings.
 *
 * @param originalSettings - The settings to duplicate
 * @param newCollectionId - The ID for the new collection
 * @returns The duplicated settings data for the new collection
 */
export function prepareDuplicateSettingsData(
  originalSettings: CollectionSettings,
  newCollectionId: string
): CollectionSettingsData {
  return {
    collectionId: newCollectionId,
    status: "draft", // Always set duplicated collections as draft
    isFeatured: originalSettings.isFeatured,
    layout: originalSettings.layout,
    showLabel: originalSettings.showLabel,
    showBanner: originalSettings.showBanner,
    showInNav: originalSettings.showInNav,
    tags: originalSettings.tags,
    internalNotes: originalSettings.internalNotes,
    customCTA: originalSettings.customCTA,
  };
}

// Types for SEO operations
export interface SeoMetaData {
  title?: string;
  description?: string;
  keywords?: string;
}

export interface SeoUpsertResult {
  seoId: string;
  seoRow: Seo;
}

export interface SeoUpsertOptions {
  collectionId?: string;
  meta: CollectionFormType["meta"] | CollectionDraftFormType["meta"];
}

/**
 * Upserts SEO metadata for a collection
 * @param options - SEO upsert options including collection ID, meta data, and transaction
 * @returns Promise resolving to SEO upsert result with ID and row data
 */
export async function upsertSeoMeta(tx: Trx, { collectionId, meta }: SeoUpsertOptions): Promise<SeoUpsertResult> {
  let seoRow: Seo | undefined;

  if (collectionId) {
    // Try to find existing SEO row by collection id
    const existing = await tx.query.collectionsTable.findFirst({
      where: eq(collectionsTable.id, collectionId),
    });

    if (existing?.seoId) {
      // Update existing SEO row
      [seoRow] = await tx
        .update(seoTable)
        .set({
          metaTitle: meta?.title || "",
          metaDescription: meta?.description || "",
          keywords: meta?.keywords || "",
          deletedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(seoTable.id, existing.seoId))
        .returning();
    }
  }

  if (!seoRow) {
    // Insert new SEO row
    [seoRow] = await tx
      .insert(seoTable)
      .values({
        metaTitle: meta?.title || "",
        metaDescription: meta?.description || "",
        keywords: meta?.keywords || "",
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
  }

  if (!seoRow) {
    throw new Error("Failed to upsert SEO meta");
  }

  return {
    seoId: seoRow.id,
    seoRow,
  };
}

interface SoftDeleteSeoProps {
  seoId: string;
}

/**
 * Marks the specified SEO metadata as deleted by setting its deletedAt and updatedAt timestamps.
 *
 * @param seoId - The ID of the SEO metadata to soft delete
 */
export async function softDeleteSeo(trx: Trx, { seoId }: SoftDeleteSeoProps): Promise<void> {
  await trx.update(seoTable).set({ deletedAt: new Date(), updatedAt: new Date() }).where(eq(seoTable.id, seoId));
}

// Types for slug operations
export interface SlugGenerationOptions {
  title: string;
  customSlug?: string;
  maxAttempts?: number;
}

export interface SlugValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Generates a unique slug by appending an incrementing counter to the base slug if needed.
 *
 * Attempts to find a unique slug by checking for existing collections with the same slug, up to a maximum number of attempts.
 *
 * @param baseSlug - The initial slug to use as a base
 * @param maxAttempts - The maximum number of attempts to find a unique slug (default is 100)
 * @returns A unique slug string
 * @throws If a unique slug cannot be generated within the allowed number of attempts
 */
export async function generateUniqueSlug(baseSlug: string, maxAttempts = 100): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (await existingCollection(slug)) {
    if (counter > maxAttempts) {
      throw new Error(`Unable to generate unique slug after ${maxAttempts} attempts`);
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Creates a slug from title or custom slug
 * @param options - Slug generation options
 * @returns Promise resolving to a unique slug
 */
export async function createCollectionSlug({
  title,
  customSlug,
  maxAttempts = 100,
}: SlugGenerationOptions): Promise<string> {
  const baseSlug = customSlug ?? slugify(title);
  return generateUniqueSlug(baseSlug, maxAttempts);
}

/**
 * Validates a slug format
 * @param slug - The slug to validate
 * @returns Validation result with boolean and optional error message
 */
export function validateSlug(slug: string): SlugValidationResult {
  if (!slug || slug.trim().length === 0) {
    return {
      isValid: false,
      error: "Slug cannot be empty",
    };
  }

  if (slug.length > 100) {
    return {
      isValid: false,
      error: "Slug cannot be longer than 100 characters",
    };
  }

  // Check for valid slug format (lowercase, hyphens, alphanumeric)
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(slug)) {
    return {
      isValid: false,
      error: "Slug can only contain lowercase letters, numbers, and hyphens",
    };
  }

  return { isValid: true };
}

/**
 * Generates a unique slug for a duplicated collection by appending "-copy" to the original slug.
 *
 * @param originalSlug - The slug of the collection being duplicated
 * @returns A promise that resolves to a unique slug for the duplicate collection
 */
export async function generateDuplicateSlug(originalSlug: string): Promise<string> {
  const baseSlug = `${originalSlug}-copy`;
  return generateUniqueSlug(baseSlug);
}

type CacheOptions<T> = {
  key: string;
  ttl?: number; // in seconds
  redis: typeof redis;
  query: () => Promise<T>;
};
