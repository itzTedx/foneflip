"use server";

import crypto from "crypto";
import { getSession } from "@/lib/auth/server";
import { env } from "@/lib/env/server";
import { createLog } from "@/lib/utils";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { mediaTable } from "@ziron/db/schema";
import { MediaToInsert } from "@ziron/db/types";

const log = createLog("Collection");

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

interface Props {
  file: {
    type: string;
    size: number;
    fileName?: string;
  };
  collection?: string;
  checksum: string;
}

export async function getSignedURL({ file, checksum, collection }: Props) {
  const session = await getSession();

  if (!session) {
    return { error: true, message: "Not Authenticated" };
  }

  if (!acceptedFileTypes.includes(file.type)) {
    return { error: true, message: "Invalid file type" };
  }

  if (file.size > maxSize) {
    return { error: true, message: "File too large" };
  }

  // Generate a unique key: userId/checksum-fileName
  const safeFileName = (file.fileName || "file").replace(
    /[^a-zA-Z0-9._-]/g,
    "_",
  );

  const key = collection
    ? `${session.user.id}/${collection}/${generateFileName()}-${safeFileName}`
    : `${session.user.id}/${generateFileName()}-${safeFileName}`;

  const putObjectCommand = new PutObjectCommand({
    Bucket: env.AWS_BUCKET_NAME,
    Key: key,
    ContentType: file.type,
    ContentLanguage: file.size.toString(),
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
  media: MediaToInsert,
  transaction?: any,
): Promise<string> {
  const dbOrTx = transaction || (await import("@ziron/db")).db;
  log.info("Performing upsert for Media", {
    data: media,
  });

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
      key: media.key,
      updatedAt: new Date(),
    })
    .returning();

  log.info("Media Uploaded", {
    data: inserted,
  });

  if (!inserted) throw new Error("Failed to upsert media row");
  return inserted.id;
}

export async function deleteMediaFromS3(key: string) {
  const deleteParams = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
  };

  await s3.send(new DeleteObjectCommand(deleteParams));

  return {
    success: "Deleted",
  };
}
