"use client";

import dynamic from "next/dynamic";

const LeadPhotosSection = dynamic(
  () =>
    import("@/features/leads/components/lead-photos-section").then((m) => ({
      default: m.LeadPhotosSection,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/40" />
    ),
  }
);

export function LeadPhotosLazy({ leadId }: { leadId: string }) {
  return <LeadPhotosSection leadId={leadId} />;
}
