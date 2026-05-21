"use client";

import { useId } from "react";
import { ImagePlus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toastError } from "@/components/ui/toast-utils";
import { cn } from "@/lib/utils";

type ImageUploaderProps = {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  hint?: string;
  maxSizeMB?: number;
  className?: string;
};

export function ImageUploader({
  value,
  onChange,
  label = "Image",
  hint = "PNG, JPG, or WEBP. Max 2 MB.",
  maxSizeMB = 2,
  className,
}: ImageUploaderProps) {
  const inputId = useId();

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toastError("Only image files are allowed.");
      event.target.value = "";
      return;
    }

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      toastError(`Image must be ${maxSizeMB} MB or smaller.`);
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      onChange(String(readerEvent.target?.result || ""));
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
        <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      </div>

      <label
        htmlFor={inputId}
        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-background p-5 text-center transition-colors hover:border-primary/50"
      >
        <ImagePlus className="size-6 text-muted-foreground" />
        <span className="text-sm font-medium">Choose image</span>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
        />
      </label>

      {value ? (
        <div className="overflow-hidden rounded-lg border bg-background">
          <img
            src={value}
            alt="Selected preview"
            className="h-52 w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <div className="flex items-center justify-between gap-3 border-t p-3">
            <p className="truncate text-sm text-muted-foreground">
              Preview loaded
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange("")}
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
