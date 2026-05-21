"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toastError } from "@/components/ui/toast-utils";
import { getAdminPageMeta } from "@/lib/admin-nav";

type AdminShellProps = {
  children: React.ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const pageMeta = getAdminPageMeta(pathname);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("[admin] Logout error:", error);
      toastError("Failed to logout.");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-72 md:block">
        <AdminSidebar />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 sm:max-w-72">
          <SheetHeader className="sr-only">
            <SheetTitle>Admin navigation</SheetTitle>
            <SheetDescription>Navigate portfolio admin pages.</SheetDescription>
          </SheetHeader>
          <AdminSidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <AdminTopbar
        title={pageMeta.label}
        description={pageMeta.description}
        onMenuClick={() => setMobileOpen(true)}
        onLogout={handleLogout}
      />

      <main className="min-h-screen pt-16 md:pl-72">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
