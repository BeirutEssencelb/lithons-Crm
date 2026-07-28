"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadImageUpload } from "@/features/leads/components/lead-image-upload";
import { LeadImageGallery } from "@/features/leads/components/lead-image-gallery";

interface LeadPhotosSectionProps {
  leadId: string;
}

export function LeadPhotosSection({ leadId }: LeadPhotosSectionProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5">
      <h2 className="mb-4 text-lg font-semibold tracking-tight">Photos</h2>
      <Tabs defaultValue="gallery">
        <TabsList variant="line" className="mb-4 w-full max-w-full overflow-x-auto">
          <TabsTrigger value="gallery" className="flex-1 sm:flex-none">
            Gallery
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex-1 sm:flex-none">
            Upload
          </TabsTrigger>
        </TabsList>
        <TabsContent value="gallery">
          <LeadImageGallery leadId={leadId} refreshKey={refreshKey} />
        </TabsContent>
        <TabsContent value="upload">
          <LeadImageUpload
            leadId={leadId}
            onUploaded={() => setRefreshKey((k) => k + 1)}
          />
        </TabsContent>
      </Tabs>
    </section>
  );
}
