export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!url || !key) return false;
  if (url.includes("placeholder") || url.includes("your-project")) return false;
  if (key.includes("placeholder") || key.includes("your-")) return false;

  return true;
}

export const DEV_PREVIEW_COOKIE = "lithos_dev_preview";
