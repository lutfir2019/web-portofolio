"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  technologies: string;
  liveLink: string;
  githubLink: string;
  featured: boolean;
  createdAt: string;
}

export default function ProjectsPage() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    technologies: "",
    liveLink: "",
    githubLink: "",
    featured: false,
  });

  // Fetch projects
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      setProjects(data?.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects");
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "file") {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64String = event.target?.result as string;
          setFormData({
            ...formData,
            image: base64String,
          });
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({
        ...formData,
        [name]:
          type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingId) {
        // Update existing project
        const res = await fetch(`/api/projects/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) throw new Error("Failed to update project");

        setProjects(
          projects.map((p) => (p.id === editingId ? { ...p, ...formData } : p)),
        );

        toast({
          title: "Success",
          description: "Project updated successfully",
        });
      } else {
        // Add new project
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) throw new Error("Failed to create project");

        const data = await res.json();
        if (data?.data) {
          setProjects([...projects, data.data]);
        }

        toast({
          title: "Success",
          description: "Project created successfully",
        });
      }
      resetForm();
    } catch (err) {
      console.error("Error submitting form:", err);
      toast({
        title: "Error",
        description: editingId
          ? "Failed to update project"
          : "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image: "",
      technologies: "",
      liveLink: "",
      githubLink: "",
      featured: false,
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (project: Project) => {
    setFormData({
      title: project.title,
      description: project.description,
      image: project.image || "",
      technologies: project.technologies,
      liveLink: project.liveLink,
      githubLink: project.githubLink,
      featured: project.featured,
    });
    setEditingId(project.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete project");

      setProjects(projects.filter((p) => p.id !== id));

      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting project:", err);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8 pt-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Projects</h1>
          <p className="text-foreground/60">Manage your portfolio projects</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({
              title: "",
              description: "",
              image: "",
              technologies: "",
              liveLink: "",
              githubLink: "",
              featured: false,
            });
          }}
          className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
          disabled={isLoading}
        >
          <Plus size={20} />
          New Project
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {editingId ? "Edit Project" : "Add New Project"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Project Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                placeholder="E-Commerce Platform"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground min-h-24"
                placeholder="Describe your project..."
                required
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Project Image
              </label>
              <input
                type="file"
                name="image"
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90"
                accept="image/*"
              />
              {formData.image && (
                <div className="mt-4 rounded-lg overflow-hidden border border-border">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 400 300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='16' fill='%236b7280' text-anchor='middle' dominant-baseline='middle'%3EImage failed to load%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Technologies (comma-separated)
              </label>
              <input
                type="text"
                name="technologies"
                value={formData.technologies}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                placeholder="Next.js, React, Tailwind CSS"
              />
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Live Link
                </label>
                <input
                  type="url"
                  name="liveLink"
                  value={formData.liveLink}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  GitHub Link
                </label>
                <input
                  type="url"
                  name="githubLink"
                  value={formData.githubLink}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            {/* Featured */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-border cursor-pointer"
              />
              <label
                htmlFor="featured"
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                Mark as featured
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 cursor-pointer px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    {editingId ? "Updating..." : "Creating..."}
                  </span>
                ) : editingId ? (
                  "Update Project"
                ) : (
                  "Create Project"
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting}
                className="flex-1 cursor-pointer px-4 py-2 border border-border rounded-lg hover:bg-card transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4">
          {error}
          <button
            onClick={fetchProjects}
            className="ml-4 underline hover:no-underline font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-foreground/60">Loading projects...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects?.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <p className="text-foreground/60 mb-4">No projects yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                <Plus size={18} />
                Create your first project
              </button>
            </div>
          ) : (
            projects?.map((project) => (
              <div className="grid md:grid-cols-2 gap-6" key={project.id}>
                <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors">
                  {project.image && (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">
                          {project.title}
                        </h3>
                        {Boolean(project.featured) && (
                          <span className="inline-block mt-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded font-medium">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(project)}
                          className="p-2 cursor-pointer text-foreground/60 hover:text-primary transition-colors"
                          aria-label="Edit"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="p-2 cursor-pointer text-foreground/60 hover:text-destructive transition-colors"
                          aria-label="Delete"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>

                    <p className="text-foreground/70 mb-4">
                      {project.description}
                    </p>

                    {project.technologies && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologies.split(",").map((tech) => (
                          <span
                            key={tech.trim()}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded font-medium"
                          >
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-4 text-sm">
                      {project.liveLink && (
                        <a
                          href={project.liveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          Live Demo <ExternalLink size={14} />
                        </a>
                      )}
                      {project.githubLink && (
                        <a
                          href={project.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          GitHub <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
