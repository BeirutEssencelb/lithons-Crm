import { createClient } from "@/lib/supabase/client";
import { uploadFileToB2 } from "@/components/FileUpload";
import type { PickedLeadImage } from "@/features/leads/components/lead-image-picker";

export interface LeadImageUploadResult {
  uploaded: number;
  failed: number;
  errors: string[];
}

/** Upload selected images to Backblaze B2 and save rows in lead_images. */
export async function uploadLeadImagesToB2(
  leadId: string,
  images: PickedLeadImage[],
  onProgress?: (done: number, total: number) => void
): Promise<LeadImageUploadResult> {
  if (!images.length) {
    return { uploaded: 0, failed: 0, errors: [] };
  }

  const supabase = createClient();
  let uploaded = 0;
  let failed = 0;
  const errors: string[] = [];
  let done = 0;

  await Promise.all(
    images.map(async (item) => {
      try {
        const { key } = await uploadFileToB2(item.file, `leads/${leadId}`);
        const { error } = await supabase.from("lead_images").insert({
          lead_id: leadId,
          storage_key: key,
          filename: item.file.name,
          content_type: item.file.type || "application/octet-stream",
        });
        if (error) throw error;
        uploaded += 1;
      } catch (err) {
        failed += 1;
        errors.push(
          err instanceof Error
            ? `${item.file.name}: ${err.message}`
            : `${item.file.name}: upload failed`
        );
      } finally {
        done += 1;
        onProgress?.(done, images.length);
      }
    })
  );

  return { uploaded, failed, errors };
}
