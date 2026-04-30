"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface BlogPost {
  id: number;
  title: string;
  description: string;
  url: string;
  image: string;
  published: boolean;
  publishedAt: string;
  createdAt: string;
}

export default function BlogPage() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    image: "",
    published: false,
    publishedAt: "",
  });

  // Fetch posts
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/blog");
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts");
      toast({
        title: "Error",
        description: "Failed to load posts",
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

  const generateUrl = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      url: generateUrl(title),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingId) {
        // Update existing post
        const res = await fetch(`/api/blog/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) throw new Error("Failed to update post");

        setPosts(
          posts.map((p) => (p.id === editingId ? { ...p, ...formData } : p)),
        );

        toast({
          title: "Success",
          description: "Blog post updated successfully",
        });
      } else {
        // Add new post
        const res = await fetch("/api/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) throw new Error("Failed to create post");

        const data = await res.json();
        if (data.data) {
          setPosts([...posts, data.data]);
        }

        toast({
          title: "Success",
          description: "Blog post created successfully",
        });
      }
      resetForm();
    } catch (err) {
      console.error("Error submitting form:", err);
      toast({
        title: "Error",
        description: editingId
          ? "Failed to update blog post"
          : "Failed to create blog post",
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
      url: "",
      image: "",
      published: false,
      publishedAt: "",
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (post: BlogPost) => {
    setFormData({
      title: post.title,
      description: post.description,
      url: post.url,
      image: post.image || "",
      published: post.published,
      publishedAt: formatDateInputValue(post.publishedAt),
    });
    setEditingId(post.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this blog post?")) {
      return;
    }

    try {
      const res = await fetch(`/api/blog/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete post");

      setPosts(posts.filter((p) => p.id !== id));

      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting post:", err);
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
    }
  };

  const togglePublish = async (id: number) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    try {
      const updatedPublished = !post.published;
      const res = await fetch(`/api/blog/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...post,
          published: updatedPublished,
        }),
      });

      if (!res.ok) throw new Error("Failed to update post");

      setPosts(
        posts.map((p) =>
          p.id === id
            ? {
                ...p,
                published: updatedPublished,
                publishedAt: updatedPublished
                  ? new Date().toISOString().split("T")[0]
                  : "",
              }
            : p,
        ),
      );

      toast({
        title: "Success",
        description: `Blog post ${updatedPublished ? "published" : "unpublished"} successfully`,
      });
    } catch (err) {
      console.error("Error toggling publish:", err);
      toast({
        title: "Error",
        description: "Failed to update blog post status",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateInputValue = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  function formatUrl(url: string) {
    if (!url) return "#";

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return `https://${url}`;
    }

    return url;
  }

  return (
    <div className="space-y-8 pt-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Blog</h1>
          <p className="text-foreground/60">Write and manage your articles</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
          }}
          className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
          disabled={isLoading}
        >
          <Plus size={20} />
          New Article
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {editingId ? "Edit Article" : "Write New Article"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleTitleChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                placeholder="Article title..."
                required
              />
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Blog URL
              </label>
              <input
                type="text"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                placeholder="blog-url-slug"
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
                placeholder="Brief description of your blog post..."
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Featured Image
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
                Published Date
              </label>
              <input
                type="date"
                name="publishedAt"
                value={formData.publishedAt}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                required
              />
            </div>

            {/* Published */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="published"
                name="published"
                checked={formData.published}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-border cursor-pointer"
              />
              <label
                htmlFor="published"
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                Publish this article
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
                  "Update Article"
                ) : (
                  "Create Article"
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

      {/* Posts List */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4">
          {error}
          <button
            onClick={fetchPosts}
            className="ml-4 cursor-pointer underline hover:no-underline font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-foreground/60">Loading blog posts...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <p className="text-foreground/60 mb-4">No articles yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                <Plus size={18} />
                Write your first article
              </button>
            </div>
          ) : (
            posts.map((post) => (
              <div className="grid md:grid-cols-2 gap-6" key={post.id}>
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  {post.image && (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-foreground">
                            {post.title}
                          </h3>
                          {Boolean(post.published) && (
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded font-medium">
                              Published
                            </span>
                          )}
                          {!post.published && (
                            <span className="px-2 py-1 bg-foreground/10 text-foreground/60 text-xs rounded font-medium">
                              Draft
                            </span>
                          )}
                        </div>
                        <a
                          href={formatUrl(post.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-foreground/60 hover:underline break-all"
                        >
                          Visit Website
                        </a>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => togglePublish(post.id)}
                          className="p-2 cursor-pointer text-foreground/60 hover:text-primary transition-colors"
                          title={post.published ? "Unpublish" : "Publish"}
                        >
                          {post.published ? (
                            <Eye size={20} />
                          ) : (
                            <EyeOff size={20} />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(post)}
                          className="p-2 cursor-pointer text-foreground/60 hover:text-primary transition-colors"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2 cursor-pointer text-foreground/60 hover:text-destructive transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>

                    <p className="text-foreground/70 mb-3">
                      {post.description}
                    </p>
                    <p className="text-sm text-foreground/50">
                      {post.published
                        ? `Published ${formatDate(post.publishedAt)}`
                        : `Created ${formatDate(post.createdAt)}`}
                    </p>
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
