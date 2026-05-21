"use client";

import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Edit, ExternalLink, Plus, Trash2, UserRound } from "lucide-react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { ErrorState } from "@/components/admin/error-state";
import { FormSection } from "@/components/admin/form-section";
import { ImageUploader } from "@/components/admin/image-uploader";
import { PageHeader } from "@/components/admin/page-header";
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
import { Textarea } from "@/components/ui/textarea";
import { toastError, toastSuccess } from "@/components/ui/toast-utils";
import { apiRequest } from "@/lib/api-client";
import { ensureUrl } from "@/lib/formatters";
import {
  ProfileInput,
  ProfileSchema,
  SocialLinkSchema,
} from "@/lib/validations";

type SocialLink = {
  id: number;
  platform: string;
  url: string;
  order?: number;
};

const profileDefaults: ProfileInput = {
  fullName: "Portfolio Admin",
  title: "Web Developer",
  bio: "Passionate about creating beautiful and functional web experiences",
  location: "Indonesia",
  email: "mail@example.com",
  phone: "+62 8XX XXXX XXXX",
  profileImage: "",
};

const socialFormSchema = SocialLinkSchema.extend({
  order: z.coerce.number().min(0, "Order must be 0 or higher").default(0),
});

type SocialFormValues = z.infer<typeof socialFormSchema>;

const socialDefaults: SocialFormValues = {
  platform: "GitHub",
  url: "",
  order: 0,
};

const platforms = [
  "GitHub",
  "LinkedIn",
  "Twitter",
  "Instagram",
  "Facebook",
  "Portfolio",
  "Email",
  "Other",
];

export default function ProfilePage() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socialFormOpen, setSocialFormOpen] = useState(false);
  const [editingSocial, setEditingSocial] = useState<SocialLink | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SocialLink | null>(null);

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<ProfileInput>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: profileDefaults,
  });

  const {
    formState: { errors: socialErrors, isSubmitting: isSocialSubmitting },
    handleSubmit: handleSocialSubmit,
    register: registerSocial,
    reset: resetSocial,
  } = useForm<SocialFormValues>({
    resolver: zodResolver(socialFormSchema),
    defaultValues: socialDefaults,
  });

  const profileImage = watch("profileImage");

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [profile, social] = await Promise.all([
        apiRequest<Partial<ProfileInput>>("/api/profile"),
        apiRequest<SocialLink[]>("/api/social-media"),
      ]);

      reset({
        fullName: profile.fullName || profileDefaults.fullName,
        title: profile.title || profileDefaults.title,
        bio: profile.bio || profileDefaults.bio,
        location: profile.location || profileDefaults.location,
        email: profile.email || profileDefaults.email,
        phone: profile.phone || profileDefaults.phone,
        profileImage: profile.profileImage || "",
      });
      setSocialLinks(Array.isArray(social) ? social : []);
    } catch (err) {
      console.error("[admin] Profile load error:", err);
      const message = err instanceof Error ? err.message : "Failed to load profile";
      setError(message);
      toastError(message);
    } finally {
      setIsLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  async function onSubmitProfile(values: ProfileInput) {
    try {
      await apiRequest("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      toastSuccess("Profile updated successfully.");
    } catch (err) {
      console.error("[admin] Profile save error:", err);
      toastError(err instanceof Error ? err.message : "Failed to save profile");
    }
  }

  function openCreateSocialForm() {
    setEditingSocial(null);
    resetSocial({
      ...socialDefaults,
      order: socialLinks.length + 1,
    });
    setSocialFormOpen(true);
  }

  function openEditSocialForm(link: SocialLink) {
    setEditingSocial(link);
    resetSocial({
      platform: link.platform || "Other",
      url: link.url || "",
      order: Number(link.order ?? 0),
    });
    setSocialFormOpen(true);
  }

  async function onSubmitSocial(values: SocialFormValues) {
    try {
      if (editingSocial) {
        await apiRequest(`/api/social-media/${editingSocial.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        toastSuccess("Social link updated successfully.");
      } else {
        await apiRequest("/api/social-media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        toastSuccess("Social link added successfully.");
      }

      setSocialFormOpen(false);
      setEditingSocial(null);
      resetSocial(socialDefaults);
      await loadProfile();
    } catch (err) {
      console.error("[admin] Social link save error:", err);
      toastError(err instanceof Error ? err.message : "Failed to save social link");
    }
  }

  async function handleDeleteSocialLink() {
    if (!deleteTarget) return;

    try {
      await apiRequest(`/api/social-media/${deleteTarget.id}`, {
        method: "DELETE",
      });
      setSocialLinks((current) =>
        current.filter((link) => link.id !== deleteTarget.id),
      );
      toastSuccess("Social link deleted successfully.");
    } catch (err) {
      console.error("[admin] Social link delete error:", err);
      toastError(
        err instanceof Error ? err.message : "Failed to delete social link",
      );
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Manage personal information, profile photo, and public social links."
      />

      {error ? (
        <ErrorState description={error} onRetry={() => void loadProfile()} />
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Skeleton className="h-[620px] rounded-lg" />
          <Skeleton className="h-[420px] rounded-lg" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <form
            onSubmit={handleSubmit(onSubmitProfile)}
            className="space-y-6 rounded-lg border bg-card p-5 shadow-sm"
          >
            <FormSection title="Personal Information">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" {...register("fullName")} />
                  {errors.fullName ? (
                    <p className="text-sm text-destructive">
                      {errors.fullName.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Professional Title</Label>
                  <Input id="title" {...register("title")} />
                  {errors.title ? (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register("email")} />
                  {errors.email ? (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" {...register("phone")} />
                  {errors.phone ? (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" {...register("location")} />
                {errors.location ? (
                  <p className="text-sm text-destructive">
                    {errors.location.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" rows={5} {...register("bio")} />
                {errors.bio ? (
                  <p className="text-sm text-destructive">{errors.bio.message}</p>
                ) : null}
              </div>
            </FormSection>

            <FormSection title="Profile Photo">
              <ImageUploader
                label="Profile Image"
                value={profileImage}
                onChange={(value) =>
                  setValue("profileImage", value, { shouldDirty: true })
                }
                hint="Square PNG, JPG, or WEBP works best. Max 2 MB."
              />
            </FormSection>

            <div className="flex justify-end border-t pt-5">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>

          <aside className="space-y-4 rounded-lg border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">Social Links</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Links shown on the public portfolio.
                </p>
              </div>
              <Button type="button" size="sm" onClick={openCreateSocialForm}>
                <Plus className="size-4" />
                Add
              </Button>
            </div>

            {socialLinks.length === 0 ? (
              <EmptyState
                title="No social links"
                description="Add public contact or social links."
                icon={UserRound}
                className="min-h-48"
              />
            ) : (
              <div className="space-y-2">
                {socialLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{link.platform}</p>
                      <a
                        href={ensureUrl(link.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 flex items-center gap-1 truncate text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="size-3" />
                        {link.url}
                      </a>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEditSocialForm(link)}
                        aria-label={`Edit ${link.platform}`}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteTarget(link)}
                        aria-label={`Delete ${link.platform}`}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}

      <Dialog
        open={socialFormOpen}
        onOpenChange={(open) => {
          if (isSocialSubmitting) return;
          setSocialFormOpen(open);
          if (!open) {
            setEditingSocial(null);
            resetSocial(socialDefaults);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSocial ? "Edit Social Link" : "Add Social Link"}
            </DialogTitle>
            <DialogDescription>
              Add the platform, public URL, and display order.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSocialSubmit(onSubmitSocial)} className="space-y-6">
            <FormSection title="Link Details">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <select
                  id="platform"
                  {...registerSocial("platform")}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  {platforms.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
                {socialErrors.platform ? (
                  <p className="text-sm text-destructive">
                    {socialErrors.platform.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input id="url" type="url" {...registerSocial("url")} />
                {socialErrors.url ? (
                  <p className="text-sm text-destructive">
                    {socialErrors.url.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Order</Label>
                <Input id="order" type="number" min={0} {...registerSocial("order")} />
                {socialErrors.order ? (
                  <p className="text-sm text-destructive">
                    {socialErrors.order.message}
                  </p>
                ) : null}
              </div>
            </FormSection>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSocialFormOpen(false)}
                disabled={isSocialSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSocialSubmitting}>
                {isSocialSubmitting
                  ? "Saving..."
                  : editingSocial
                    ? "Save Changes"
                    : "Add Link"}
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
        title="Delete social link?"
        description={
          deleteTarget
            ? `This will permanently delete the ${deleteTarget.platform} link.`
            : "This action cannot be undone."
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeleteSocialLink}
      />
    </div>
  );
}
