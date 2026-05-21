import { Activity } from "lucide-react";

import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";

export default function ActivityPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity"
        description="Admin create, update, and delete events can be shown here after activity logging is added."
      />
      <EmptyState
        title="No activity log yet"
        description="The current API does not persist admin activity events."
        icon={Activity}
      />
    </div>
  );
}
