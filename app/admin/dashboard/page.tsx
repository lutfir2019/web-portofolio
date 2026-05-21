"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Code2,
  FileText,
  Globe,
  Plus,
  UserRound,
  Wrench,
} from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/admin/empty-state";
import { ErrorState } from "@/components/admin/error-state";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/api-client";
import { formatNumber } from "@/lib/formatters";

type DashboardStats = {
  projects: number;
  experience: number;
  skills: number;
  blog: number;
};

const emptyStats: DashboardStats = {
  projects: 0,
  experience: 0,
  skills: 0,
  blog: 0,
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiRequest<Partial<DashboardStats>>("/api/dashboard");
      setStats({
        projects: data.projects ?? 0,
        experience: data.experience ?? 0,
        skills: data.skills ?? 0,
        blog: data.blog ?? 0,
      });
    } catch (err) {
      console.error("[admin] Dashboard stats error:", err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  const chartData = useMemo(
    () => [
      { name: "Projects", total: stats.projects },
      { name: "Skills", total: stats.skills },
      { name: "Experience", total: stats.experience },
      { name: "Blog", total: stats.blog },
    ],
    [stats],
  );

  const totalItems = chartData.reduce((sum, item) => sum + item.total, 0);

  const statCards = [
    {
      title: "Projects",
      value: stats.projects,
      description: "Portfolio entries",
      icon: Code2,
      href: "/admin/projects",
    },
    {
      title: "Skills",
      value: stats.skills,
      description: "Skill records",
      icon: Wrench,
      href: "/admin/skills",
    },
    {
      title: "Experience",
      value: stats.experience,
      description: "Timeline items",
      icon: BriefcaseBusiness,
      href: "/admin/experience",
    },
    {
      title: "Blog",
      value: stats.blog,
      description: "Article records",
      icon: FileText,
      href: "/admin/blog",
    },
  ];

  const quickActions = [
    {
      label: "Add Project",
      description: "Open portfolio project manager",
      href: "/admin/projects",
      icon: Plus,
    },
    {
      label: "Add Skill",
      description: "Update skill categories",
      href: "/admin/skills",
      icon: Wrench,
    },
    {
      label: "Edit Profile",
      description: "Review contact and profile data",
      href: "/admin/profile",
      icon: UserRound,
    },
    {
      label: "Preview Website",
      description: "Open public portfolio",
      href: "/",
      icon: Globe,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Track portfolio content and jump into common admin tasks."
        action={
          <Button asChild variant="outline">
            <Link href="/" target="_blank" rel="noreferrer">
              <Globe className="size-4" />
              Preview Website
            </Link>
          </Button>
        }
      />

      {error ? (
        <ErrorState description={error} onRetry={() => void fetchStats()} />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-36 rounded-lg" />
            ))
          : statCards.map((item) => (
              <StatCard
                key={item.title}
                title={item.title}
                value={formatNumber(item.value)}
                description={item.description}
                icon={item.icon}
                href={item.href}
              />
            ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <Card className="rounded-lg py-0 shadow-none">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle>Content Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-80 px-2 py-4 sm:px-5">
            {isLoading ? (
              <Skeleton className="h-full rounded-lg" />
            ) : totalItems > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ left: -20, right: 12 }}>
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      color: "var(--popover-foreground)",
                    }}
                  />
                  <Bar dataKey="total" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                title="No content yet"
                description="Create portfolio content to populate the dashboard."
                className="h-full min-h-0 border-0 bg-transparent"
              />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-lg py-0 shadow-none">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const isExternalPreview = action.href === "/";

              return (
                <Button
                  key={action.label}
                  asChild
                  variant="ghost"
                  className="h-auto w-full justify-start rounded-md px-3 py-3"
                >
                  <Link
                    href={action.href}
                    target={isExternalPreview ? "_blank" : undefined}
                    rel={isExternalPreview ? "noreferrer" : undefined}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block font-medium">{action.label}</span>
                      <span className="block truncate text-xs font-normal text-muted-foreground">
                        {action.description}
                      </span>
                    </span>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </Link>
                </Button>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
