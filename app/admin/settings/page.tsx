import { Settings } from "lucide-react";

import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Website-level settings can be added here when the database schema is available."
      />
      <EmptyState
        title="No settings schema available"
        description="Profile, projects, skills, experience, and blog settings remain editable from their dedicated pages."
        icon={Settings}
      />
    </div>
  );
}
