import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BriefcaseBusiness,
  Code2,
  FileText,
  FolderKanban,
  ImageIcon,
  LayoutDashboard,
  Settings,
  UserRound,
  Wrench,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const adminNavItems: AdminNavItem[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    description: "Overview and quick actions",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/projects",
    label: "Projects",
    description: "Portfolio work and case studies",
    icon: Code2,
  },
  {
    href: "/admin/experience",
    label: "Experience",
    description: "Roles, companies, and timeline",
    icon: BriefcaseBusiness,
  },
  {
    href: "/admin/skills",
    label: "Skills",
    description: "Capabilities and tool groups",
    icon: Wrench,
  },
  {
    href: "/admin/blog",
    label: "Blog",
    description: "Articles and publishing status",
    icon: FileText,
  },
  {
    href: "/admin/profile",
    label: "Profile",
    description: "Personal details and social links",
    icon: UserRound,
  },
  {
    href: "/admin/media",
    label: "Media",
    description: "Images and reusable assets",
    icon: ImageIcon,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    description: "Website configuration",
    icon: Settings,
  },
  {
    href: "/admin/activity",
    label: "Activity",
    description: "Admin changes and audit trail",
    icon: Activity,
  },
];

export function getAdminPageMeta(pathname: string | null) {
  const path = pathname || "/admin/dashboard";
  const current = [...adminNavItems]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => path === item.href || path.startsWith(`${item.href}/`));

  return (
    current ?? {
      href: path,
      label: "Admin",
      description: "Portfolio administration",
      icon: FolderKanban,
    }
  );
}
