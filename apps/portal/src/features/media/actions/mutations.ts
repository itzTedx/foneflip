"use server";

import crypto from "crypto";
import { getSession } from "@/lib/auth/server";
import { env } from "@/lib/env/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { mediaTable } from "@ziron/db/schema";

const generateFileName = (bytes = 16) =>
  crypto.randomBytes(bytes).toString("hex");

const s3 = new S3Client({
  region: env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

const maxSize = 4 * 1024 * 1024; // 4MB default
const acceptedFileTypes = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

export async function getSignedURL(
  type: string,
  size: number,
  checksum: string,
  fileName?: string,
) {
  const session = await getSession();

  if (!session) {
    return { error: true, message: "Not Authenticated" };
  }

  if (!acceptedFileTypes.includes(type)) {
    return { error: true, message: "Invalid file type" };
  }

  if (size > maxSize) {
    return { error: true, message: "File too large" };
  }

  // Generate a unique key: userId/checksum-fileName
  const safeFileName = (fileName || "file").replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${session.user.id}/${generateFileName()}-${safeFileName}`;

  const putObjectCommand = new PutObjectCommand({
    Bucket: env.AWS_BUCKET_NAME,
    Key: key,
    ContentType: type,
    ContentLanguage: size.toString(),
    ChecksumSHA256: checksum,
    Metadata: {
      userId: session.user.id,
    },
  });

  let signedURL;
  try {
    signedURL = await getSignedUrl(s3, putObjectCommand, {
      expiresIn: 120,
    });
  } catch (err) {
    return { error: true, message: "Failed to generate signed URL" };
  }

  return {
    success: { url: signedURL, key },
  };
}

/**
 * Upserts a media row in the mediaTable by URL. If not found, inserts a new row.
 * Returns the UUID of the media row.
 * @param media - Media object (url, fileName, fileSize, width, height, blurData, alt, userId)
 * @param transaction - Optional DB transaction
 */
export async function upsertMedia(
  media: {
    url: string;
    fileName?: string;
    fileSize?: number;
    width?: number;
    height?: number;
    blurData?: string;
    alt?: string;
    userId?: string;
  },
  transaction?: any,
): Promise<string> {
  const dbOrTx = transaction || (await import("@ziron/db")).db;
  // Try to find existing media by URL
  const existing = await dbOrTx.query.mediaTable.findFirst({
    where: (row: any) => row.url === media.url,
  });
  if (existing) return existing.id;
  // Insert new media row
  const [inserted] = await dbOrTx
    .insert(mediaTable)
    .values({
      url: media.url,
      fileName: media.fileName,
      fileSize: media.fileSize,
      width: media.width,
      height: media.height,
      blurData: media.blurData,
      alt: media.alt,
      userId: media.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    })
    .returning();
  if (!inserted) throw new Error("Failed to upsert media row");
  return inserted.id;
}
