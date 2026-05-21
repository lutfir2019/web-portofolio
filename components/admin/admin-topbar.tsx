"use client";

import Link from "next/link";
import { ExternalLink, LogOut, Menu } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

type AdminTopbarProps = {
  title: string;
  description?: string;
  onMenuClick: () => void;
  onLogout: () => void;
};

export function AdminTopbar({
  title,
  description,
  onMenuClick,
  onLogout,
}: AdminTopbarProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:left-72">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </Button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {title}
            </p>
            {description ? (
              <p className="hidden truncate text-xs text-muted-foreground sm:block">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href="/" target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" />
              Preview
            </Link>
          </Button>
          <ThemeToggle />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onLogout}
            aria-label="Logout"
          >
            <LogOut className="size-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
