import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const ProjectSchema = z.object({
  title: z.string().min(1, 'Project title is required').max(200, 'Title is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description is too long'),
  technologies: z.string().optional(),
  liveLink: z.string().url('Invalid URL').optional().or(z.literal('')),
  githubLink: z.string().url('Invalid URL').optional().or(z.literal('')),
  featured: z.boolean().optional().default(false),
  image: z.string().optional(),
});

export const ExperienceSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required').max(100, 'Title is too long'),
  company: z.string().min(1, 'Company name is required').max(100, 'Company name is too long'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional().or(z.literal('')),
  currentlyWorking: z.boolean().optional().default(false),
  description: z.string().max(2000, 'Description is too long').optional(),
});

export const SkillSchema = z.object({
  name: z.string().min(1, 'Skill name is required').max(50, 'Skill name is too long'),
  category: z.string().min(1, 'Category is required'),
  proficiency: z.number().min(0, 'Proficiency must be at least 0').max(100, 'Proficiency cannot exceed 100'),
});

export const BlogPostSchema = z.object({
  title: z.string().min(1, 'Post title is required').max(200, 'Title is too long'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters').max(500, 'Excerpt is too long'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  published: z.boolean().optional().default(false),
});

export const ProfileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100, 'Name is too long'),
  title: z.string().max(100, 'Title is too long').optional(),
  bio: z.string().max(500, 'Bio is too long').optional(),
  location: z.string().max(100, 'Location is too long').optional(),
  phone: z.string().max(20, 'Phone number is too long').optional(),
  email: z.string().email('Invalid email address'),
  profileImage: z.string().optional(),
});

export const SocialLinkSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  url: z.string().url('Invalid URL'),
});

// Type exports for use in components
export type LoginInput = z.infer<typeof LoginSchema>;
export type ProjectInput = z.infer<typeof ProjectSchema>;
export type ExperienceInput = z.infer<typeof ExperienceSchema>;
export type SkillInput = z.infer<typeof SkillSchema>;
export type BlogPostInput = z.infer<typeof BlogPostSchema>;
export type ProfileInput = z.infer<typeof ProfileSchema>;
export type SocialLinkInput = z.infer<typeof SocialLinkSchema>;


export interface TProject extends Omit<ProjectInput, 'technologies'> {
  id: number;
  technologies: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TExperience extends ExperienceInput {
  id: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface TSkill extends SkillInput {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface TBlogPost extends BlogPostInput {
  id: number;
  image?: string;
  url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TProfile extends ProfileInput {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface TSocialLink extends SocialLinkInput {
  id: number;
  createdAt: string;
  updatedAt: string;
}