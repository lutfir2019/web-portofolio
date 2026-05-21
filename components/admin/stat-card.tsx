import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  href?: string;
  className?: string;
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  className,
}: StatCardProps) {
  const content = (
    <Card
      className={cn(
        "rounded-lg border-border/80 py-0 shadow-none transition-colors hover:border-primary/40",
        className,
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {value}
            </p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-md border bg-background text-primary">
            <Icon className="size-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : (
            <span />
          )}
          {href ? <ArrowUpRight className="size-4 text-muted-foreground" /> : null}
        </div>
      </CardContent>
    </Card>
  );

  if (!href) return content;

  return (
    <Link href={href} className="block focus:outline-none focus:ring-2 focus:ring-ring">
      {content}
    </Link>
  );
}
