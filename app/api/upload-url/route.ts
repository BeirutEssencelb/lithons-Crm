import { NextResponse } from "next/server";
import { z } from "zod";
import { buildObjectKey, getUploadUrl } from "@/lib/b2";

const bodySchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  folder: z.string().min(1).default("uploads"),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { filename, contentType, folder } = parsed.data;
    if (!contentType.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image uploads are allowed" },
        { status: 400 }
      );
    }

    const key = buildObjectKey(folder, filename);
    const uploadUrl = await getUploadUrl(key, contentType);

    return NextResponse.json({ uploadUrl, key });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create upload URL";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
