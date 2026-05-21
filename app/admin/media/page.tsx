import { ImageIcon } from "lucide-react";

import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";

export default function MediaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Media"
        description="Centralized image and asset management can be connected to Supabase Storage."
      />
      <EmptyState
        title="Media library is not connected yet"
        description="Current image upload still uses validated base64 previews to stay compatible with the existing API."
        icon={ImageIcon}
      />
    </div>
  );
}
