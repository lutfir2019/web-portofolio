"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ToolbarOption = {
  label: string;
  value: string;
};

type DataToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  status?: string;
  onStatusChange?: (value: string) => void;
  statusOptions?: ToolbarOption[];
  category?: string;
  onCategoryChange?: (value: string) => void;
  categoryOptions?: ToolbarOption[];
  sort?: string;
  onSortChange?: (value: string) => void;
  sortOptions?: ToolbarOption[];
  onReset?: () => void;
  className?: string;
};

export function DataToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  status,
  onStatusChange,
  statusOptions = [],
  category,
  onCategoryChange,
  categoryOptions = [],
  sort,
  onSortChange,
  sortOptions = [],
  onReset,
  className,
}: DataToolbarProps) {
  const hasFilters =
    Boolean(search) ||
    (status !== undefined && status !== "all") ||
    (category !== undefined && category !== "all") ||
    (sort !== undefined && sort !== "default");

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:items-center",
        className,
      )}
    >
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9"
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {statusOptions.length > 0 && onStatusChange ? (
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            aria-label="Filter status"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : null}

        {categoryOptions.length > 0 && onCategoryChange ? (
          <select
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            aria-label="Filter category"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : null}

        {sortOptions.length > 0 && onSortChange ? (
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            aria-label="Sort"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : null}

        {onReset ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={!hasFilters}
          >
            {hasFilters ? <X className="size-4" /> : <SlidersHorizontal className="size-4" />}
            Reset
          </Button>
        ) : null}
      </div>
    </div>
  );
}
