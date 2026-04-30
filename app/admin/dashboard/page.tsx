'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, FileText, Code, Briefcase, Users, Mail } from 'lucide-react';

interface DashboardStats {
  projects: number;
  experience: number;
  skills: number;
  blog: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    projects: 0,
    experience: 0,
    skills: 0,
    blog: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/dashboard');
        const data = await res.json();

        if (res.ok) {
          setStats({
            projects: data.projects ?? 0,
            experience: data.experience ?? 0,
            skills: data.skills ?? 0,
            blog: data.blog ?? 0,
          });
        } else {
          console.error('[v0] Error fetching dashboard stats:', data);
        }
      } catch (error) {
        console.error('[v0] Error fetching dashboard stats:', error);
      }
    }

    fetchStats();
  }, []);

  const quickActions = [
    {
      title: 'Projects',
      description: 'Manage your portfolio projects',
      count: stats.projects,
      icon: Code,
      href: '/admin/projects',
      color: 'from-blue-500/20 to-blue-500/5',
    },
    {
      title: 'Experience',
      description: 'Manage your work experience',
      count: stats.experience,
      icon: Briefcase,
      href: '/admin/experience',
      color: 'from-purple-500/20 to-purple-500/5',
    },
    {
      title: 'Skills',
      description: 'Manage your skills and expertise',
      count: stats.skills,
      icon: Users,
      href: '/admin/skills',
      color: 'from-green-500/20 to-green-500/5',
    },
    {
      title: 'Blog Posts',
      description: 'Write and manage articles',
      count: stats.blog,
      icon: FileText,
      href: '/admin/blog',
      color: 'from-orange-500/20 to-orange-500/5',
    },
  ];

  return (
    <div className="space-y-8 pt-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-foreground/60">Welcome to your portfolio admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-lg"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">{action.title}</h3>
              <p className="text-sm text-foreground/60 mb-4">{action.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">{action.count}</span>
                <ArrowRight size={18} className="text-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-2xl font-bold text-foreground mb-6">Quick Links</h2>
        <div className="space-y-3">
          <Link
            href="/admin/projects"
            className="flex items-center justify-between p-4 rounded-lg hover:bg-background transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Code size={20} className="text-primary" />
              <div>
                <p className="font-medium text-foreground">Create New Project</p>
                <p className="text-sm text-foreground/60">Add a new project to your portfolio</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-foreground/40 group-hover:text-primary transition-colors" />
          </Link>

          <Link
            href="/admin/blog"
            className="flex items-center justify-between p-4 rounded-lg hover:bg-background transition-colors group"
          >
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-primary" />
              <div>
                <p className="font-medium text-foreground">Write New Article</p>
                <p className="text-sm text-foreground/60">Share your knowledge and insights</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-foreground/40 group-hover:text-primary transition-colors" />
          </Link>

          <Link
            href="/admin/profile"
            className="flex items-center justify-between p-4 rounded-lg hover:bg-background transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-primary" />
              <div>
                <p className="font-medium text-foreground">Update Profile</p>
                <p className="text-sm text-foreground/60">Edit your personal information</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-foreground/40 group-hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Tip</h3>
        <p className="text-foreground/70">
          Keep your portfolio updated with your latest projects, skills, and experiences to attract potential clients and employers.
        </p>
      </div>
    </div>
  );
}
