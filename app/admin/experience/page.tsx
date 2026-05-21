"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { BriefcaseBusiness, CalendarDays, Edit, Plus, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DataToolbar } from "@/components/admin/data-toolbar";
import { EmptyState } from "@/components/admin/empty-state";
import { ErrorState } from "@/components/admin/error-state";
import { FormSection } from "@/components/admin/form-section";
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
import { formatMonthYear } from "@/lib/formatters";
import { ExperienceSchema } from "@/lib/validations";

type Experience = {
  id: number;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate?: string | null;
  currentlyWorking: boolean;
  description?: string | null;
  order: number;
  createdAt?: string;
  updatedAt?: string;
};

const experienceFormSchema = ExperienceSchema.extend({
  order: z.coerce.number().min(0, "Order must be 0 or higher").default(0),
});

type ExperienceFormValues = z.infer<typeof experienceFormSchema>;

const defaultValues: ExperienceFormValues = {
  jobTitle: "",
  company: "",
  startDate: "",
  endDate: "",
  currentlyWorking: false,
  description: "",
  order: 0,
};

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<Experience | null>(null);
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
  } = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues,
  });

  const currentlyWorking = watch("currentlyWorking");

  const fetchExperiences = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiRequest<Experience[]>("/api/experience");
      setExperiences(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[admin] Experience load error:", err);
      const message =
        err instanceof Error ? err.message : "Failed to load experience";
      setError(message);
      toastError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchExperiences();
  }, [fetchExperiences]);

  useEffect(() => {
    if (currentlyWorking) {
      setValue("endDate", "", { shouldDirty: true });
    }
  }, [currentlyWorking, setValue]);

  const filteredExperiences = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...experiences]
      .filter((experience) => {
        const matchesSearch =
          !query ||
          experience.jobTitle.toLowerCase().includes(query) ||
          experience.company.toLowerCase().includes(query) ||
          (experience.description || "").toLowerCase().includes(query);

        const matchesStatus =
          status === "all" ||
          (status === "current" && experience.currentlyWorking) ||
          (status === "past" && !experience.currentlyWorking);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sort === "order-asc") return (a.order ?? 0) - (b.order ?? 0);
        if (sort === "start-desc") {
          return (
            new Date(b.startDate || 0).getTime() -
            new Date(a.startDate || 0).getTime()
          );
        }
        if (sort === "company-asc") return a.company.localeCompare(b.company);
        return (b.order ?? 0) - (a.order ?? 0);
      });
  }, [experiences, search, sort, status]);

  function openCreateForm() {
    setEditingExperience(null);
    reset(defaultValues);
    setFormOpen(true);
  }

  function openEditForm(experience: Experience) {
    setEditingExperience(experience);
    reset({
      jobTitle: experience.jobTitle || "",
      company: experience.company || "",
      startDate: experience.startDate || "",
      endDate: experience.endDate || "",
      currentlyWorking: Boolean(experience.currentlyWorking),
      description: experience.description || "",
      order: Number(experience.order ?? 0),
    });
    setFormOpen(true);
  }

  async function onSubmit(values: ExperienceFormValues) {
    const payload = {
      ...values,
      endDate: values.currentlyWorking ? "" : values.endDate,
    };

    try {
      await apiRequest("/api/experience", {
        method: editingExperience ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingExperience ? { id: editingExperience.id, ...payload } : payload,
        ),
      });

      toastSuccess(
        editingExperience
          ? "Experience updated successfully."
          : "Experience added successfully.",
      );
      setFormOpen(false);
      setEditingExperience(null);
      reset(defaultValues);
      await fetchExperiences();
    } catch (err) {
      console.error("[admin] Experience save error:", err);
      toastError(err instanceof Error ? err.message : "Failed to save experience");
    }
  }

  async function handleDeleteExperience() {
    if (!deleteTarget) return;

    try {
      await apiRequest(`/api/experience?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      setExperiences((current) =>
        current.filter((experience) => experience.id !== deleteTarget.id),
      );
      toastSuccess("Experience deleted successfully.");
    } catch (err) {
      console.error("[admin] Experience delete error:", err);
      toastError(
        err instanceof Error ? err.message : "Failed to delete experience",
      );
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Experience"
        description="Manage work history, timeline order, and current role status."
        action={
          <Button type="button" onClick={openCreateForm} disabled={isLoading}>
            <Plus className="size-4" />
            Add Experience
          </Button>
        }
      />

      <DataToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search experience..."
        status={status}
        onStatusChange={setStatus}
        statusOptions={[
          { label: "All roles", value: "all" },
          { label: "Current", value: "current" },
          { label: "Past", value: "past" },
        ]}
        sort={sort}
        onSortChange={setSort}
        sortOptions={[
          { label: "Order high to low", value: "order-desc" },
          { label: "Order low to high", value: "order-asc" },
          { label: "Newest start date", value: "start-desc" },
          { label: "Company A-Z", value: "company-asc" },
        ]}
        onReset={() => {
          setSearch("");
          setStatus("all");
          setSort("order-desc");
        }}
      />

      {error ? (
        <ErrorState description={error} onRetry={() => void fetchExperiences()} />
      ) : null}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : filteredExperiences.length === 0 ? (
        <EmptyState
          title={
            experiences.length === 0 ? "No experience yet" : "No experience found"
          }
          description={
            experiences.length === 0
              ? "Add the first timeline item."
              : "Adjust search or filters."
          }
          icon={BriefcaseBusiness}
          action={
            <Button type="button" onClick={openCreateForm}>
              <Plus className="size-4" />
              Add Experience
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredExperiences.map((experience) => (
            <article
              key={experience.id}
              className="rounded-lg border bg-card p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">
                      {experience.jobTitle}
                    </h2>
                    {experience.currentlyWorking ? (
                      <StatusBadge status="Present" />
                    ) : null}
                    <StatusBadge status={`Order ${experience.order ?? 0}`} />
                  </div>
                  <p className="mt-1 font-medium text-primary">
                    {experience.company}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="size-4" />
                    <span>
                      {formatMonthYear(experience.startDate)} -{" "}
                      {experience.currentlyWorking
                        ? "Present"
                        : formatMonthYear(experience.endDate)}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEditForm(experience)}
                    aria-label={`Edit ${experience.jobTitle}`}
                  >
                    <Edit className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setDeleteTarget(experience)}
                    aria-label={`Delete ${experience.jobTitle}`}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              {experience.description ? (
                <p className="mt-4 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                  {experience.description}
                </p>
              ) : null}
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
            setEditingExperience(null);
            reset(defaultValues);
          }
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingExperience ? "Edit Experience" : "Add Experience"}
            </DialogTitle>
            <DialogDescription>
              Dates control timeline order on the public portfolio.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormSection title="Role">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input id="jobTitle" {...register("jobTitle")} />
                  {errors.jobTitle ? (
                    <p className="text-sm text-destructive">
                      {errors.jobTitle.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" {...register("company")} />
                  {errors.company ? (
                    <p className="text-sm text-destructive">
                      {errors.company.message}
                    </p>
                  ) : null}
                </div>
              </div>
            </FormSection>

            <FormSection title="Timeline">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" {...register("startDate")} />
                  {errors.startDate ? (
                    <p className="text-sm text-destructive">
                      {errors.startDate.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    disabled={currentlyWorking}
                    {...register("endDate")}
                  />
                  {errors.endDate ? (
                    <p className="text-sm text-destructive">
                      {errors.endDate.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="currentlyWorking"
                  render={({ field }) => (
                    <div className="flex items-center justify-between gap-4 rounded-lg border bg-background p-3">
                      <div>
                        <Label htmlFor="currentlyWorking">Current Role</Label>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Show this role as present.
                        </p>
                      </div>
                      <Switch
                        id="currentlyWorking"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  )}
                />
                <div className="space-y-2">
                  <Label htmlFor="order">Order</Label>
                  <Input id="order" type="number" min={0} {...register("order")} />
                  {errors.order ? (
                    <p className="text-sm text-destructive">{errors.order.message}</p>
                  ) : null}
                </div>
              </div>
            </FormSection>

            <FormSection title="Description">
              <div className="space-y-2">
                <Label htmlFor="description">Summary</Label>
                <Textarea
                  id="description"
                  rows={5}
                  {...register("description")}
                />
                {errors.description ? (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                ) : null}
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
                  : editingExperience
                    ? "Save Changes"
                    : "Add Experience"}
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
        title="Delete experience?"
        description={
          deleteTarget
            ? `This will permanently delete "${deleteTarget.jobTitle}" at ${deleteTarget.company}.`
            : "This action cannot be undone."
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeleteExperience}
      />
    </div>
  );
}
