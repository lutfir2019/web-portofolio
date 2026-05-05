"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ArrowRight, ExternalLink, Github } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { SkeletonProject } from "@/components/skeletons/skeleton";
import { AnimatedBackground } from "@/components/animated-background";
import {
  TBlogPost,
  TExperience,
  TProfile,
  TProject,
  TSkill,
} from "@/lib/validations";

export default function Home() {
  const [profile, setProfile] = useState<TProfile | null>(null);
  const [projects, setProjects] = useState<TProject[]>([]);
  const [experiences, setExperiences] = useState<TExperience[]>([]);
  const [skills, setSkills] = useState<TSkill[]>([]);
  const [blogs, setBlogs] = useState<TBlogPost[]>([]);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreProjects, setHasMoreProjects] = useState(false);
  const [totalProjects, setTotalProjects] = useState(0);
  const [projectError, setProjectError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      setIsInitialLoading(true);
      setProjectError(null);

      try {
        const [profileRes, projectsRes, experienceRes, skillsRes, blogsRes] =
          await Promise.all([
            fetch("/api/profile"),
            fetch("/api/projects?page=1&limit=4"),
            fetch("/api/experience"),
            fetch("/api/skills"),
            fetch("/api/blog?published=true"),
          ]);

        const [
          profileBody,
          projectsBody,
          experienceBody,
          skillsBody,
          blogsBody,
        ] = await Promise.all([
          profileRes.json(),
          projectsRes.json(),
          experienceRes.json(),
          skillsRes.json(),
          blogsRes.json(),
        ]);

        const profileData = profileBody as TProfile;
        if (profileData.title) {
          setProfile(profileData);
        }

        const projectItems = Array.isArray(projectsBody.data)
          ? projectsBody.data
          : [];
        const sortedProject = [...projectItems].sort(
          (a, b) => b.order - a.order,
        );
        const projectPagination = projectsBody.pagination;

        setProjects(
          sortedProject.map((p: TProject) => ({
            ...p,
            technologies:
              typeof p.technologies === "string"
                ? (p.technologies as string)
                    ?.split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                : p.technologies,
          })),
        );

        setCurrentPage(projectPagination?.page ?? 1);
        setTotalProjects(projectPagination?.total ?? 0);
        setHasMoreProjects(
          projectPagination
            ? projectPagination.page < projectPagination.totalPages
            : false,
        );

        const experienceData = experienceBody as TExperience[];

        if (Array.isArray(experienceData)) {
          const sorted = [...experienceData].sort((a, b) => b.order - a.order);
          setExperiences(sorted);
        }

        const skillsData = skillsBody as TSkill[];
        if (Array.isArray(skillsData)) setSkills(skillsData);

        const blogsData = blogsBody as TBlogPost[];
        if (Array.isArray(blogsData)) setBlogs(blogsData.slice(0, 3));
      } catch (error) {
        console.error("Error loading initial page data:", error);
        setProjectError("Failed to load projects. Please try again.");
      } finally {
        setIsInitialLoading(false);
      }
    }

    loadInitialData();
  }, []);

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMoreProjects) return;

    setIsLoadingMore(true);
    setProjectError(null);
    const nextPage = currentPage + 1;

    try {
      const res = await fetch(`/api/projects?page=${nextPage}&limit=4`);
      const { data, pagination } = await res.json();

      if (Array.isArray(data)) {
        const newProjects = data.map((p) => ({
          ...p,
          technologies:
            typeof p.technologies === "string"
              ? (p.technologies as string)
                  ?.split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
              : p.technologies,
        }));

        setProjects((prevProjects) => [...prevProjects, ...newProjects]);
        setCurrentPage(nextPage);
        setHasMoreProjects(nextPage < pagination.totalPages);
      } else {
        setProjectError("Failed to load more projects.");
      }
    } catch (error) {
      console.error("Error loading more projects:", error);
      setProjectError("Failed to load more projects. Please try again.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-primary/10 blur-[80px]" />
        </div>

        <div className="relative flex flex-col items-center justify-center z-10">
          <div className="relative w-24 h-24 mb-10 flex items-center justify-center">
            {/* Outer spinning ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-[2px] border-primary/20 border-t-primary/80 border-r-primary/80"
            />

            {/* Inner spinning ring (opposite direction) */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-3 rounded-full border-[2px] border-primary/20 border-b-primary/80 border-l-primary/80"
            />

            {/* Center glowing core */}
            <motion.div
              animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-6 h-6 rounded-full bg-primary shadow-lg shadow-primary/60"
            />
          </div>

          {/* Loading text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="text-lg md:text-xl font-bold tracking-[0.25em] text-primary uppercase font-mono">
              Initializing
            </div>

            {/* Tech loading bar */}
            <div className="w-48 h-[2px] bg-primary/20 rounded-full overflow-hidden relative">
              <motion.div
                className="absolute inset-y-0 left-0 bg-primary w-1/3"
                animate={{ x: ["-100%", "300%"] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background flex flex-col">
      <AnimatedBackground />

      <div className="relative z-10 flex flex-col flex-1">
        <Header />

        {/* Hero Section */}
        <section id="home" className="relative flex-1 flex items-center">
          <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 w-full">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* LEFT CONTENT */}
              <div className="flex flex-col gap-6 text-center md:text-left">
                {/* Badge */}
                <span className="inline-flex mx-auto md:mx-0 w-fit px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 backdrop-blur">
                  👋 Welcome to my portfolio
                </span>

                {/* Name */}
                <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-primary">
                  Hi, I'm {profile?.fullName}
                </h2>

                {/* Title */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold leading-tight tracking-tight">
                  {profile?.title}
                </h1>

                {/* Bio */}
                <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto md:mx-0 leading-relaxed">
                  {profile?.bio}
                </p>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mt-4">
                  <a
                    href="#projects"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all font-medium group"
                  >
                    View My Work
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </a>

                  <a
                    href="#contact"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-border hover:bg-card transition-all hover:scale-105 active:scale-95 font-medium"
                  >
                    Get In Touch
                  </a>
                </div>
              </div>

              {/* RIGHT IMAGE */}
              <div className="flex justify-center md:justify-end">
                <div className="relative group">
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl opacity-70 group-hover:opacity-100 transition"></div>

                  {profile?.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt={profile.fullName || "Profile photo"}
                      className="relative w-40 h-40 sm:w-52 sm:h-52 md:w-64 md:h-64 rounded-full object-cover border-4 border-white/10 shadow-2xl group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="relative w-40 h-40 sm:w-52 sm:h-52 md:w-64 md:h-64 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center text-4xl md:text-5xl text-primary shadow-2xl">
                      {profile?.fullName
                        ? profile.fullName
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)
                        : "PP"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section
          id="projects"
          className="py-20 md:py-32 border-t border-border"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Featured Projects
              </h2>
              <p className="text-lg text-foreground/70">
                Showcase of my recent work and technical expertise
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isInitialLoading
                ? [1, 2, 3, 4].map((index) => (
                    <motion.div
                      key={`skeleton-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                      <SkeletonProject />
                    </motion.div>
                  ))
                : projects.map((project, idx) => (
                    <motion.div
                      key={project.id || idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: idx * 0.05 }}
                      className="group border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20 bg-card"
                    >
                      <motion.div
                        className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative overflow-hidden"
                        whileHover={{ scale: 1.05 }}
                      >
                        {project?.image ? (
                          <img
                            src={project?.image}
                            alt={project?.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            <motion.div
                              animate={{ y: [0, -10, 0] }}
                              transition={{ duration: 3, repeat: Infinity }}
                              className="text-5xl"
                            >
                              🚀
                            </motion.div>
                            <p className="text-foreground/60 mt-2">
                              Project Image
                            </p>
                          </>
                        )}
                      </motion.div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {project.title}
                        </h3>
                        <p className="text-foreground/70 text-sm mb-4">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {Array.isArray(project.technologies)
                            ? project?.technologies?.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded font-medium"
                                >
                                  {tag}
                                </span>
                              ))
                            : null}
                        </div>
                        <div className="flex gap-3">
                          <a
                            href={project.liveLink || "#"}
                            className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all text-sm font-medium group"
                          >
                            Live Demo <ExternalLink size={16} />
                          </a>
                          <a
                            href={project.githubLink || "#"}
                            className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors text-sm font-medium"
                          >
                            <Github size={16} /> Code
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              {isLoadingMore && !isInitialLoading
                ? [1, 2].map((index) => (
                    <motion.div
                      key={`loadmore-skeleton-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <SkeletonProject />
                    </motion.div>
                  ))
                : null}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mt-12 text-center"
            >
              {hasMoreProjects && (
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-card transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-medium group"
                >
                  {isLoadingMore ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More Projects
                      <ArrowRight
                        size={18}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </>
                  )}
                </button>
              )}
              {!hasMoreProjects && projects.length > 0 && (
                <p className="text-foreground/60 text-sm">
                  All projects loaded ({projects.length}/{totalProjects})
                </p>
              )}
              {projectError ? (
                <p className="mt-4 text-sm text-destructive">{projectError}</p>
              ) : null}
            </motion.div>
          </div>
        </section>

        {/* Experience Section */}
        <section
          id="experience"
          className="py-20 md:py-32 border-t border-border"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Experience
              </h2>
              <p className="text-lg text-foreground/70">
                My professional journey and work experience
              </p>
            </motion.div>

            <div className="relative space-y-10">
              {/* vertical line */}
              <div className="absolute left-3 top-0 h-full w-[2px] bg-gradient-to-b from-primary/40 via-primary/10 to-transparent" />

              {experiences.map((exp, idx) => (
                <motion.div
                  key={exp.id || idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="relative pl-12"
                >
                  {/* dot indicator */}
                  <div className="absolute left-0 top-3 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                    </div>
                  </div>

                  {/* card */}
                  <div className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-3 gap-4">
                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                          {exp.jobTitle}
                        </h3>
                        <p className="text-sm text-primary/80 font-medium">
                          {exp.company}
                        </p>
                      </div>

                      <span className="text-xs sm:text-sm text-foreground/60 whitespace-nowrap">
                        {new Date(exp.startDate).getFullYear()} -{" "}
                        {exp.currentlyWorking
                          ? "Present"
                          : exp.endDate
                            ? new Date(exp.endDate).getFullYear()
                            : "-"}
                      </span>
                    </div>

                    <p className="text-sm text-foreground/70 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="py-20 md:py-32 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Skills & Technologies
              </h2>
              <p className="text-lg text-foreground/70">
                Tools and technologies I work with
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {skills.map((skill, idx) => (
                <motion.div
                  key={skill.id || idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="p-4 bg-card border border-border rounded-lg text-center hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all group cursor-pointer"
                >
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {skill.name}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section id="blog" className="py-20 md:py-32 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Latest Articles
              </h2>
              <p className="text-lg text-foreground/70">
                Thoughts and insights about web development
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((post, idx) => (
                <motion.article
                  key={post.id || idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all bg-card group"
                >
                  <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0"
                        animate={{ x: ["100%", "-100%"] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-foreground/60 mb-2">
                      {post.published
                        ? new Date(post.updatedAt).toLocaleDateString()
                        : "Draft"}
                    </p>
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-foreground/70 text-sm mb-4">
                      {post.excerpt}
                    </p>
                    <a
                      href={post.url ?? "#"}
                      className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all text-sm font-medium group/link"
                    >
                      Read Article{" "}
                      <ArrowRight
                        size={16}
                        className="group-hover/link:translate-x-1 transition-transform"
                      />
                    </a>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section
          id="contact"
          className="py-20 md:py-32 border-t border-border relative"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Get In Touch
            </h2>
            <p className="text-lg text-foreground/70 mb-8">
              Interested in collaborating? Feel free to reach out. I'm always
              open to discussing new projects, creative ideas, or opportunities.
            </p>
            <motion.a
              href={`mailto:${profile?.email}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-lg group"
            >
              Send Me An Email
              <ArrowRight
                size={20}
                className="group-hover:translate-x-2 transition-transform"
              />
            </motion.a>
          </motion.div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
