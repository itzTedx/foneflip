import { S3Client } from "@aws-sdk/client-s3";
import { createUploadRouteHandler, type Router, route, UploadFileError } from "better-upload/server";
import crypto from "crypto";

import { getSession } from "@/lib/auth/server";
import { env } from "@/lib/env/server";

const s3 = new S3Client({
  region: env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

const generateFileName = (bytes = 16) => crypto.randomBytes(bytes).toString("hex");

const router: Router = {
  client: s3,
  bucketName: env.AWS_BUCKET_NAME,
  routes: {
    demo: route({
      fileTypes: ["image/*"],
      multipleFiles: true,
      maxFiles: 4,
    }),
    collection: route({
      fileTypes: ["image/*"],

      maxFileSize: 1024 * 1024 * 5, // 5MB
      onBeforeUpload: async ({ req, file, clientMetadata }) => {
        const session = await getSession();
        if (!session) {
          throw new UploadFileError("Not logged in!");
        }

        const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const key = `collections/${generateFileName()}-${safeFileName}`;

        console.log("Uploading File", file, req, clientMetadata, key);

        return {
          objectKey: key,
        };
      },
      onAfterSignedUrl: async ({ req, file, metadata, clientMetadata }) => {
        const publicUrl = `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_BUCKET_REGION}.amazonaws.com/${file.objectKey}`;

        return {
          metadata: {
            url: publicUrl,
          },
        };
      },
    }),
  },
};

export const { POST } = createUploadRouteHandler(router);
