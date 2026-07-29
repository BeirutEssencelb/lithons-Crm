import { readFileSync } from "fs";
import {
  GetBucketCorsCommand,
  PutBucketCorsCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function loadEnv() {
  const text = readFileSync(".env.local", "utf8");
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const client = new S3Client({
  endpoint: process.env.B2_ENDPOINT,
  region: process.env.B2_REGION,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY,
  },
  forcePathStyle: true,
});

const Bucket = process.env.B2_BUCKET_NAME;

const cors = {
  CORSRules: [
    {
      AllowedOrigins: [
        "https://lithons-crm.vercel.app",
        "http://localhost:3000",
      ],
      AllowedMethods: ["PUT", "GET", "HEAD"],
      AllowedHeaders: ["*"],
      ExposeHeaders: ["ETag", "x-amz-request-id"],
      MaxAgeSeconds: 3600,
    },
  ],
};

await client.send(
  new PutBucketCorsCommand({ Bucket, CORSConfiguration: cors })
);
console.log("PutBucketCors: OK for bucket", Bucket);

const got = await client.send(new GetBucketCorsCommand({ Bucket }));
console.log(JSON.stringify(got.CORSRules, null, 2));
