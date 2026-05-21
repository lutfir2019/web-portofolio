"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
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
import { ensureUrl, formatDate, formatDateInputValue, slugify } from "@/lib/formatters";
import {
  AdminBlogPostInput,
  AdminBlogPostSchema,
} from "@/lib/validations";

type BlogPost = {
  id: number;
  title: string;
  description: string;
  url: string;
  image?: string | null;
  published: boolean;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

const defaultValues: AdminBlogPostInput = {
  title: "",
  description: "",
  url: "",
  image: "",
  published: false,
  publishedAt: "",
};

function todayInputValue() {
  return new Date().toISOString().split("T")[0];
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("published-desc");

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<AdminBlogPostInput>({
    resolver: zodResolver(AdminBlogPostSchema),
    defaultValues,
  });

  const imageValue = watch("image");
  const titleField = register("title");

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiRequest<BlogPost[]>("/api/blog");
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[admin] Blog load error:", err);
      const message = err instanceof Error ? err.message : "Failed to load posts";
      setError(message);
      toastError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...posts]
      .filter((post) => {
        const matchesSearch =
          !query ||
          post.title.toLowerCase().includes(query) ||
          post.description.toLowerCase().includes(query) ||
          post.url.toLowerCase().includes(query);

        const matchesStatus =
          status === "all" ||
          (status === "published" && post.published) ||
          (status === "draft" && !post.published);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sort === "title-asc") return a.title.localeCompare(b.title);
        if (sort === "created-desc") {
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        }
        if (sort === "created-asc") {
          return (
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
          );
        }
        return (
          new Date(b.publishedAt || b.createdAt || 0).getTime() -
          new Date(a.publishedAt || a.createdAt || 0).getTime()
        );
      });
  }, [posts, search, sort, status]);

  function openCreateForm() {
    setEditingPost(null);
    reset(defaultValues);
    setFormOpen(true);
  }

  function openEditForm(post: BlogPost) {
    setEditingPost(post);
    reset({
      title: post.title || "",
      description: post.description || "",
      url: post.url || "",
      image: post.image || "",
      published: Boolean(post.published),
      publishedAt: formatDateInputValue(post.publishedAt),
    });
    setFormOpen(true);
  }

  async function onSubmit(values: AdminBlogPostInput) {
    const payload = {
      ...values,
      publishedAt:
        values.published && !values.publishedAt
          ? todayInputValue()
          : values.publishedAt,
    };

    try {
      if (editingPost) {
        await apiRequest(`/api/blog/${editingPost.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toastSuccess("Blog post updated successfully.");
      } else {
        await apiRequest("/api/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toastSuccess("Blog post created successfully.");
      }

      setFormOpen(false);
      setEditingPost(null);
      reset(defaultValues);
      await fetchPosts();
    } catch (err) {
      console.error("[admin] Blog save error:", err);
      toastError(err instanceof Error ? err.message : "Failed to save post");
    }
  }

  async function handleDeletePost() {
    if (!deleteTarget) return;

    try {
      await apiRequest(`/api/blog/${deleteTarget.id}`, { method: "DELETE" });
      setPosts((current) => current.filter((post) => post.id !== deleteTarget.id));
      toastSuccess("Blog post deleted successfully.");
    } catch (err) {
      console.error("[admin] Blog delete error:", err);
      toastError(err instanceof Error ? err.message : "Failed to delete post");
    }
  }

  async function togglePublish(post: BlogPost) {
    const nextPublished = !post.published;

    try {
      await apiRequest(`/api/blog/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...post,
          published: nextPublished,
          publishedAt: nextPublished ? todayInputValue() : "",
        }),
      });

      setPosts((current) =>
        current.map((item) =>
          item.id === post.id
            ? {
                ...item,
                published: nextPublished,
                publishedAt: nextPublished ? todayInputValue() : "",
              }
            : item,
        ),
      );
      toastSuccess(`Blog post ${nextPublished ? "published" : "unpublished"}.`);
    } catch (err) {
      console.error("[admin] Blog publish error:", err);
      toastError(err instanceof Error ? err.message : "Failed to update status");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog"
        description="Write and manage article cards, images, links, and publish status."
        action={
          <Button type="button" onClick={openCreateForm} disabled={isLoading}>
            <Plus className="size-4" />
            New Article
          </Button>
        }
      />

      <DataToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search articles..."
        status={status}
        onStatusChange={setStatus}
        statusOptions={[
          { label: "All posts", value: "all" },
          { label: "Published", value: "published" },
          { label: "Draft", value: "draft" },
        ]}
        sort={sort}
        onSortChange={setSort}
        sortOptions={[
          { label: "Published newest", value: "published-desc" },
          { label: "Created newest", value: "created-desc" },
          { label: "Created oldest", value: "created-asc" },
          { label: "Title A-Z", value: "title-asc" },
        ]}
        onReset={() => {
          setSearch("");
          setStatus("all");
          setSort("published-desc");
        }}
      />

      {error ? (
        <ErrorState description={error} onRetry={() => void fetchPosts()} />
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-56 rounded-lg" />
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <EmptyState
          title={posts.length === 0 ? "No articles yet" : "No articles found"}
          description={
            posts.length === 0
              ? "Create the first article card."
              : "Adjust search or status filters."
          }
          icon={FileText}
          action={
            <Button type="button" onClick={openCreateForm}>
              <Plus className="size-4" />
              Write Article
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="grid overflow-hidden rounded-lg border bg-card shadow-sm sm:grid-cols-[180px_minmax(0,1fr)]"
            >
              <div className="h-44 bg-muted sm:h-full">
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <FileText className="size-8" />
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <StatusBadge status={post.published ? "Published" : "Draft"} />
                    </div>
                    <h2 className="line-clamp-2 text-lg font-semibold">
                      {post.title}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {post.published
                        ? `Published ${formatDate(post.publishedAt)}`
                        : `Created ${formatDate(post.createdAt)}`}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => void togglePublish(post)}
                      aria-label={post.published ? "Unpublish post" : "Publish post"}
                    >
                      {post.published ? (
                        <Eye className="size-4" />
                      ) : (
                        <EyeOff className="size-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEditForm(post)}
                      aria-label={`Edit ${post.title}`}
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleteTarget(post)}
                      aria-label={`Delete ${post.title}`}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {post.description}
                </p>

                <Button asChild variant="outline" size="sm" className="mt-auto w-fit">
                  <a href={ensureUrl(post.url)} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-4" />
                    Open Link
                  </a>
                </Button>
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
            setEditingPost(null);
            reset(defaultValues);
          }
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? "Edit Article" : "New Article"}
            </DialogTitle>
            <DialogDescription>
              Add the title, article link, description, image, and publishing state.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormSection title="Article Info">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...titleField}
                  onChange={(event) => {
                    void titleField.onChange(event);
                    if (!editingPost) {
                      setValue("url", slugify(event.target.value), {
                        shouldDirty: true,
                      });
                    }
                  }}
                />
                {errors.title ? (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL or Slug</Label>
                <Input id="url" {...register("url")} />
                {errors.url ? (
                  <p className="text-sm text-destructive">{errors.url.message}</p>
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
            </FormSection>

            <FormSection title="Media">
              <ImageUploader
                label="Featured Image"
                value={imageValue}
                onChange={(value) =>
                  setValue("image", value, { shouldDirty: true })
                }
              />
            </FormSection>

            <FormSection title="Publish Settings">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="publishedAt">Published Date</Label>
                  <Input
                    id="publishedAt"
                    type="date"
                    {...register("publishedAt")}
                  />
                  {errors.publishedAt ? (
                    <p className="text-sm text-destructive">
                      {errors.publishedAt.message}
                    </p>
                  ) : null}
                </div>
                <Controller
                  control={control}
                  name="published"
                  render={({ field }) => (
                    <div className="flex items-center justify-between gap-4 rounded-lg border bg-background p-3">
                      <div>
                        <Label htmlFor="published">Published</Label>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Show this article on the public site.
                        </p>
                      </div>
                      <Switch
                        id="published"
                        checked={field.value}
                        onCheckedChange={(value) => {
                          field.onChange(value);
                          if (value) {
                            setValue("publishedAt", todayInputValue(), {
                              shouldDirty: true,
                            });
                          }
                        }}
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
                  : editingPost
                    ? "Save Changes"
                    : "Create Article"}
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
        title="Delete article?"
        description={
          deleteTarget
            ? `This will permanently delete "${deleteTarget.title}".`
            : "This action cannot be undone."
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeletePost}
      />
    </div>
  );
}
