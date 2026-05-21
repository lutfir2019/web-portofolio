import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: string;
  className?: string;
};

const statusStyles: Record<string, string> = {
  active:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  draft:
    "border-muted-foreground/20 bg-muted text-muted-foreground",
  featured:
    "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  hidden:
    "border-muted-foreground/20 bg-muted text-muted-foreground",
  present:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  published:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const key = status.toLowerCase();

  return (
    <Badge
      variant="outline"
      className={cn("capitalize", statusStyles[key], className)}
    >
      {status}
    </Badge>
  );
}
