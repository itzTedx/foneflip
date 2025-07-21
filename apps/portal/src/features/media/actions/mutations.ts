"use server";

import { getSession } from "@/lib/auth/server";
import { env } from "@/lib/env/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

const maxSize = 2 * 1024 * 1024; // 2MB default
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
) {
  console.log("[getSignedURL] called with:", {
    type,
    size,
    acceptedFileTypes,
    maxSize,
    checksum,
  });
  const session = await getSession();
  console.log("CHECKSUM: ", checksum);
  if (!session) {
    return { error: true, message: "Not Authenticated" };
  }

  if (!acceptedFileTypes.includes(type)) {
    return { error: true, message: "Invalid file type" };
  }

  if (size > maxSize) {
    return { error: true, message: "File too large" };
  }

  const putObjectCommand = new PutObjectCommand({
    Bucket: env.AWS_BUCKET_NAME,
    Key: "test-file",
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
    success: { url: signedURL },
  };
}
