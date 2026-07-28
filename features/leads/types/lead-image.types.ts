export interface LeadImage {
  id: string;
  lead_id: string;
  storage_key: string;
  filename: string;
  content_type: string;
  uploaded_at: string;
}

export const MAX_LEAD_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
export const LEAD_IMAGE_PAGE_SIZE = 20;
