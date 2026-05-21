"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNavItems } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  onNavigate?: () => void;
};

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col border-r bg-card">
      <div className="border-b px-5 py-5">
        <Link
          href="/admin/dashboard"
          onClick={onNavigate}
          className="block rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <p className="text-lg font-semibold tracking-tight">Portfolio</p>
          <p className="text-sm text-muted-foreground">Admin Portal</p>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
