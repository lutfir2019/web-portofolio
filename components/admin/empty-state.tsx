import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed bg-card/60 p-8 text-center",
        className,
      )}
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-md border bg-background text-muted-foreground">
        <Icon className="size-6" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
