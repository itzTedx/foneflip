import { eq } from "drizzle-orm";

import { db } from "@ziron/db";
import {
  collectionSettingsTable,
  collectionsTable,
  seoTable,
} from "@ziron/db/schema";
import { slugify } from "@ziron/utils";

import type { Collection, CollectionSettings, Seo } from "../types";
import { existingCollection } from "../actions/queries";

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
  status?: string;
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
 * Validates collection data
 * @param data - Collection data to validate
 * @returns Validation result with boolean and error messages
 */
export function validateCollectionData(
  data: CollectionData,
): CollectionValidationResult {
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

  if (
    data.sortOrder !== undefined &&
    (data.sortOrder < 0 || !Number.isInteger(data.sortOrder))
  ) {
    errors.push("Sort order must be a non-negative integer");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Upserts collection settings
 * @param settingsData - Collection settings data
 * @param transaction - Database transaction (optional)
 * @returns Promise resolving to upserted settings
 */
export async function upsertCollectionSettings(
  settingsData: CollectionSettingsData,
  transaction: any = db,
): Promise<CollectionSettings | null> {
  const data = {
    ...settingsData,
    deletedAt: null,
    updatedAt: new Date(),
  };

  // Try update first
  const [existingSettings] = await transaction
    .update(collectionSettingsTable)
    .set(data)
    .where(eq(collectionSettingsTable.collectionId, settingsData.collectionId))
    .returning();

  if (!existingSettings) {
    // Insert if not exists
    const [newSettings] = await transaction
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
 * Creates duplicate collection data
 * @param originalCollection - The original collection to duplicate
 * @param newSlug - The new slug for the duplicate
 * @param newSeoId - The new SEO ID for the duplicate
 * @returns Prepared collection data for the duplicate
 */
export function prepareDuplicateCollectionData(
  originalCollection: Collection,
  newSlug: string,
  newSeoId?: string,
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
 * Creates duplicate settings data
 * @param originalSettings - The original settings to duplicate
 * @param newCollectionId - The new collection ID
 * @returns Prepared settings data for the duplicate
 */
export function prepareDuplicateSettingsData(
  originalSettings: CollectionSettings,
  newCollectionId: string,
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
  meta: SeoMetaData;
  transaction?: any; // Use any to handle both db and transaction types
}

/**
 * Upserts SEO metadata for a collection
 * @param options - SEO upsert options including collection ID, meta data, and transaction
 * @returns Promise resolving to SEO upsert result with ID and row data
 */
export async function upsertSeoMeta({
  collectionId,
  meta,
  transaction = db,
}: SeoUpsertOptions): Promise<SeoUpsertResult> {
  let seoRow: Seo | undefined;

  if (collectionId) {
    // Try to find existing SEO row by collection id
    const existing = await transaction.query.collectionsTable.findFirst({
      where: eq(collectionsTable.id, collectionId),
    });

    if (existing?.seoId) {
      // Update existing SEO row
      [seoRow] = await transaction
        .update(seoTable)
        .set({
          metaTitle: meta.title || "",
          metaDescription: meta.description || "",
          keywords: meta.keywords || "",
          deletedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(seoTable.id, existing.seoId))
        .returning();
    }
  }

  if (!seoRow) {
    // Insert new SEO row
    [seoRow] = await transaction
      .insert(seoTable)
      .values({
        metaTitle: meta.title || "",
        metaDescription: meta.description || "",
        keywords: meta.keywords || "",
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

/**
 * Soft deletes SEO metadata
 * @param seoId - The SEO ID to delete
 * @param transaction - Database transaction (optional)
 */
export async function softDeleteSeo(
  seoId: string,
  transaction: any = db,
): Promise<void> {
  await transaction
    .update(seoTable)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(seoTable.id, seoId));
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
 * Generates a unique slug for a collection
 * @param baseSlug - The base slug to start with
 * @param maxAttempts - Maximum number of attempts to find a unique slug (default: 100)
 * @returns Promise resolving to a unique slug
 */
export async function generateUniqueSlug(
  baseSlug: string,
  maxAttempts = 100,
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (await existingCollection(slug)) {
    if (counter > maxAttempts) {
      throw new Error(
        `Unable to generate unique slug after ${maxAttempts} attempts`,
      );
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
 * Generates a duplicate slug for collection duplication
 * @param originalSlug - The original collection slug
 * @returns Promise resolving to a unique duplicate slug
 */
export async function generateDuplicateSlug(
  originalSlug: string,
): Promise<string> {
  const baseSlug = `${originalSlug}-copy`;
  return generateUniqueSlug(baseSlug);
}
