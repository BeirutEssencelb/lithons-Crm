import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

/**
 * Backblaze B2 via S3-compatible API.
 *
 * Env:
 *  B2_KEY_ID
 *  B2_APPLICATION_KEY
 *  B2_BUCKET_NAME
 *  B2_ENDPOINT
 *  B2_REGION
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function getB2Client() {
  return new S3Client({
    endpoint: requireEnv("B2_ENDPOINT"),
    region: requireEnv("B2_REGION"),
    credentials: {
      accessKeyId: requireEnv("B2_KEY_ID"),
      secretAccessKey: requireEnv("B2_APPLICATION_KEY"),
    },
    forcePathStyle: true,
  });
}

function getBucket() {
  return requireEnv("B2_BUCKET_NAME");
}

/** Presigned PUT URL for uploading an object. */
export async function getUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 300
): Promise<string> {
  const client = getB2Client();
  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

/** Presigned GET URL for viewing/downloading an object. */
export async function getDownloadUrl(
  key: string,
  expiresInSeconds = 3600
): Promise<string> {
  const client = getB2Client();
  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: key,
  });
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

/** Delete an object from the B2 bucket. */
export async function deleteFile(key: string): Promise<void> {
  const client = getB2Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: getBucket(),
      Key: key,
    })
  );
}

/** Build a namespaced object key: `${folder}/${uuid}-${filename}` */
export function buildObjectKey(folder: string, filename: string): string {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const cleanFolder = folder.replace(/^\/+|\/+$/g, "");
  return `${cleanFolder}/${uuidv4()}-${safeName}`;
}
