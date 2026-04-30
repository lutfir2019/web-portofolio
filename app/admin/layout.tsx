"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  FileText,
  Briefcase,
  Users,
  Code,
  Mail,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/projects", label: "Projects", icon: Code },
    { href: "/admin/experience", label: "Experience", icon: Briefcase },
    { href: "/admin/skills", label: "Skills", icon: Users },
    { href: "/admin/blog", label: "Blog", icon: FileText },
    { href: "/admin/profile", label: "Profile", icon: Mail },
  ];

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("[v0] Logout error:", error);
    }
  }

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-40 w-64 bg-card border-r border-border transition-transform duration-300 h-screen ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground">Portfolio</h2>
            <p className="text-sm text-foreground/60">Admin Panel</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-foreground/70 hover:text-foreground hover:bg-card"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon size={20} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full cursor-pointer flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/70 hover:text-foreground hover:bg-card transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Top Bar */}
        <div className="fixed top-0 left-0 right-0 md:left-64 z-30 bg-card border-b border-border p-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-foreground">
            Portfolio Admin
          </h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground md:hidden"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 pt-24">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 md:hidden z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
}
