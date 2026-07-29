"use client";

/**
 * Shared helpers for presigned PUT uploads to B2 via /api/upload-url.
 */

export type UploadProgressHandler = (progress: number) => void;

export async function requestUploadUrl(input: {
  filename: string;
  contentType: string;
  folder: string;
}): Promise<{ uploadUrl: string; key: string }> {
  const res = await fetch("/api/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to get upload URL");
  }

  return data;
}

/** PUT file to a presigned URL with upload progress (XHR). */
export function putFileWithProgress(
  uploadUrl: string,
  file: File,
  onProgress?: UploadProgressHandler
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
      } else {
        reject(new Error(`Upload failed (${xhr.status})`));
      }
    };

    xhr.onerror = () =>
      reject(
        new Error(
          "Network error during upload — usually B2 CORS. Allow s3_put from your site origin on the bucket (see b2-cors-rules.json)."
        )
      );
    xhr.send(file);
  });
}

export async function uploadFileToB2(
  file: File,
  folder: string,
  onProgress?: UploadProgressHandler
): Promise<{ key: string }> {
  const { uploadUrl, key } = await requestUploadUrl({
    filename: file.name,
    contentType: file.type || "application/octet-stream",
    folder,
  });

  await putFileWithProgress(uploadUrl, file, onProgress);
  return { key };
}
