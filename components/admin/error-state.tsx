import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Unable to load data",
  description = "The request failed. Try again in a moment.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
      <AlertCircle className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-destructive/80">{description}</p>
      </div>
      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="shrink-0 border-destructive/40 text-destructive hover:text-destructive"
        >
          Retry
        </Button>
      ) : null}
    </div>
  );
}
