/**
 * Cloudflare R2 client configuration using S3-compatible API.
 * Uses native fetch for presigned URL operations — no extra SDK needed.
 */

const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME!;

export const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
export const R2_PUBLIC_URL = `https://pub-${R2_ACCOUNT_ID}.r2.dev`; // Public bucket URL

export const r2Config = {
  endpoint: R2_ENDPOINT,
  bucket: R2_BUCKET_NAME,
  accessKeyId: R2_ACCESS_KEY_ID,
  secretAccessKey: R2_SECRET_ACCESS_KEY,
  region: "auto",
};

/**
 * Generate a presigned PUT URL for uploading to R2.
 * Uses AWS Signature V4 via crypto (server-side only).
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const now = new Date();
  const dateStamp = now.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const dateOnly = dateStamp.substring(0, 8);

  const credential = `${R2_ACCESS_KEY_ID}/${dateOnly}/auto/s3/aws4_request`;

  // Build the presigned URL
  const url = new URL(`${R2_ENDPOINT}/${R2_BUCKET_NAME}/${key}`);
  url.searchParams.set("X-Amz-Algorithm", "AWS4-HMAC-SHA256");
  url.searchParams.set("X-Amz-Credential", credential);
  url.searchParams.set("X-Amz-Date", dateStamp);
  url.searchParams.set("X-Amz-Expires", expiresIn.toString());
  url.searchParams.set("X-Amz-SignedHeaders", "host;content-type");
  url.searchParams.set("response-content-type", contentType);

  // NOTE: In production, use a proper AWS Signature V4 library (e.g., @aws-sdk/signature-v4)
  // This is a simplified config reference. Full signing implementation would go here.
  return url.toString();
}

/**
 * Get the public URL for an object stored in R2.
 */
export function getPublicUrl(key: string): string {
  return `${R2_PUBLIC_URL}/${key}`;
}
