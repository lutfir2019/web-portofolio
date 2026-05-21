"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Code2,
  Edit,
  ExternalLink,
  Github,
  Plus,
  Trash2,
} from "lucide-react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DataToolbar } from "@/components/admin/data-toolbar";
import { EmptyState } from "@/components/admin/empty-state";
import { ErrorState } from "@/components/admin/error-state";
import { FormSection } from "@/components/admin/form-section";
import { ImageUploader } from "@/components/admin/image-uploader";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toastError, toastSuccess } from "@/components/ui/toast-utils";
import { apiRequest } from "@/lib/api-client";
import { ensureUrl, splitCommaList } from "@/lib/formatters";
import { ProjectSchema } from "@/lib/validations";

type Project = {
  id: number;
  title: string;
  description: string;
  image?: string | null;
  technologies?: string | null;
  liveLink?: string | null;
  githubLink?: string | null;
  featured: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
};

type ProjectsResponse = {
  data?: Project[];
};

const projectFormSchema = ProjectSchema.extend({
  order: z.coerce.number().min(0, "Order must be 0 or higher").default(0),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

const defaultValues: ProjectFormValues = {
  title: "",
  description: "",
  image: "",
  technologies: "",
  liveLink: "",
  githubLink: "",
  featured: false,
  order: 0,
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("order-desc");

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues,
  });

  const imageValue = watch("image");

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest<ProjectsResponse>(
        "/api/projects?limit=100",
      );
      const data = Array.isArray(response?.data) ? response.data : [];
      setProjects(data);
    } catch (err) {
      console.error("[admin] Projects load error:", err);
      const message = err instanceof Error ? err.message : "Failed to load projects";
      setError(message);
      toastError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...projects]
      .filter((project) => {
        const technologies = project.technologies || "";
        const matchesSearch =
          !query ||
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          technologies.toLowerCase().includes(query);

        const matchesStatus =
          status === "all" ||
          (status === "featured" && project.featured) ||
          (status === "standard" && !project.featured);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sort === "order-asc") return (a.order ?? 0) - (b.order ?? 0);
        if (sort === "title-asc") return a.title.localeCompare(b.title);
        if (sort === "created-desc") {
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        }
        return (b.order ?? 0) - (a.order ?? 0);
      });
  }, [projects, search, sort, status]);

  function openCreateForm() {
    setEditingProject(null);
    reset(defaultValues);
    setFormOpen(true);
  }

  function openEditForm(project: Project) {
    setEditingProject(project);
    reset({
      title: project.title || "",
      description: project.description || "",
      image: project.image || "",
      technologies: project.technologies || "",
      liveLink: project.liveLink || "",
      githubLink: project.githubLink || "",
      featured: Boolean(project.featured),
      order: Number(project.order ?? 0),
    });
    setFormOpen(true);
  }

  async function onSubmit(values: ProjectFormValues) {
    try {
      if (editingProject) {
        await apiRequest(`/api/projects/${editingProject.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        toastSuccess("Project updated successfully.");
      } else {
        await apiRequest("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        toastSuccess("Project created successfully.");
      }

      setFormOpen(false);
      setEditingProject(null);
      reset(defaultValues);
      await fetchProjects();
    } catch (err) {
      console.error("[admin] Project save error:", err);
      toastError(err instanceof Error ? err.message : "Failed to save project");
    }
  }

  async function handleDeleteProject() {
    if (!deleteTarget) return;

    try {
      await apiRequest(`/api/projects/${deleteTarget.id}`, {
        method: "DELETE",
      });
      setProjects((current) =>
        current.filter((project) => project.id !== deleteTarget.id),
      );
      toastSuccess("Project deleted successfully.");
    } catch (err) {
      console.error("[admin] Project delete error:", err);
      toastError(err instanceof Error ? err.message : "Failed to delete project");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage portfolio projects, images, links, order, and featured state."
        action={
          <Button type="button" onClick={openCreateForm} disabled={isLoading}>
            <Plus className="size-4" />
            New Project
          </Button>
        }
      />

      <DataToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search projects..."
        status={status}
        onStatusChange={setStatus}
        statusOptions={[
          { label: "All projects", value: "all" },
          { label: "Featured", value: "featured" },
          { label: "Standard", value: "standard" },
        ]}
        sort={sort}
        onSortChange={setSort}
        sortOptions={[
          { label: "Order high to low", value: "order-desc" },
          { label: "Order low to high", value: "order-asc" },
          { label: "Title A-Z", value: "title-asc" },
          { label: "Newest", value: "created-desc" },
        ]}
        onReset={() => {
          setSearch("");
          setStatus("all");
          setSort("order-desc");
        }}
      />

      {error ? (
        <ErrorState description={error} onRetry={() => void fetchProjects()} />
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-80 rounded-lg" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          title={projects.length === 0 ? "No projects yet" : "No projects found"}
          description={
            projects.length === 0
              ? "Create the first portfolio project."
              : "Adjust search or filter values."
          }
          icon={Code2}
          action={
            <Button type="button" onClick={openCreateForm}>
              <Plus className="size-4" />
              Create Project
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <article
              key={project.id}
              className="overflow-hidden rounded-lg border bg-card shadow-sm"
            >
              <div className="relative h-44 bg-muted">
                {project.image ? (
                  <img
                    src={project.image}
                    alt={project.title}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <Code2 className="size-8" />
                  </div>
                )}
              </div>

              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="line-clamp-1 text-lg font-semibold">
                      {project.title}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {project.featured ? (
                        <StatusBadge status="Featured" />
                      ) : null}
                      <StatusBadge status={`Order ${project.order ?? 0}`} />
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEditForm(project)}
                      aria-label={`Edit ${project.title}`}
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleteTarget(project)}
                      aria-label={`Delete ${project.title}`}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {project.description}
                </p>

                {project.technologies ? (
                  <div className="flex flex-wrap gap-2">
                    {splitCommaList(project.technologies).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md border bg-background px-2 py-1 text-xs text-muted-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2 border-t pt-4">
                  {project.liveLink ? (
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={ensureUrl(project.liveLink)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="size-4" />
                        Live
                      </a>
                    </Button>
                  ) : null}
                  {project.githubLink ? (
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={ensureUrl(project.githubLink)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Github className="size-4" />
                        Code
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (isSubmitting) return;
          setFormOpen(open);
          if (!open) {
            setEditingProject(null);
            reset(defaultValues);
          }
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? "Edit Project" : "New Project"}
            </DialogTitle>
            <DialogDescription>
              Keep project content concise and publication-ready.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormSection title="Basic Info">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input id="title" {...register("title")} />
                {errors.title ? (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  {...register("description")}
                />
                {errors.description ? (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="technologies">Technologies</Label>
                <Input
                  id="technologies"
                  placeholder="Next.js, Supabase, Tailwind CSS"
                  {...register("technologies")}
                />
                {errors.technologies ? (
                  <p className="text-sm text-destructive">
                    {errors.technologies.message}
                  </p>
                ) : null}
              </div>
            </FormSection>

            <FormSection title="Media">
              <ImageUploader
                label="Project Image"
                value={imageValue}
                onChange={(value) =>
                  setValue("image", value, { shouldDirty: true })
                }
              />
            </FormSection>

            <FormSection title="Links and Publish Settings">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="liveLink">Live Link</Label>
                  <Input id="liveLink" type="url" {...register("liveLink")} />
                  {errors.liveLink ? (
                    <p className="text-sm text-destructive">
                      {errors.liveLink.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="githubLink">GitHub Link</Label>
                  <Input
                    id="githubLink"
                    type="url"
                    {...register("githubLink")}
                  />
                  {errors.githubLink ? (
                    <p className="text-sm text-destructive">
                      {errors.githubLink.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="order">Order</Label>
                  <Input id="order" type="number" min={0} {...register("order")} />
                  {errors.order ? (
                    <p className="text-sm text-destructive">{errors.order.message}</p>
                  ) : null}
                </div>
                <Controller
                  control={control}
                  name="featured"
                  render={({ field }) => (
                    <div className="flex items-center justify-between gap-4 rounded-lg border bg-background p-3">
                      <div>
                        <Label htmlFor="featured">Featured</Label>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Highlight this project on the website.
                        </p>
                      </div>
                      <Switch
                        id="featured"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  )}
                />
              </div>
            </FormSection>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : editingProject
                    ? "Save Changes"
                    : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete project?"
        description={
          deleteTarget
            ? `This will permanently delete "${deleteTarget.title}".`
            : "This action cannot be undone."
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeleteProject}
      />
    </div>
  );
}
