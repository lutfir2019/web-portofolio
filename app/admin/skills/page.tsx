"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Edit, Plus, Trash2, Wrench } from "lucide-react";

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
import { toastError, toastSuccess } from "@/components/ui/toast-utils";
import { apiRequest } from "@/lib/api-client";
import { SkillInput, SkillSchema } from "@/lib/validations";

type Skill = SkillInput & {
  id: number;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
};

const categories = [
  "Frontend",
  "Backend",
  "Database",
  "Language",
  "Tools",
  "Other",
];

const defaultValues: SkillInput = {
  name: "",
  category: "Frontend",
  proficiency: 80,
};

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("category-asc");

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<SkillInput>({
    resolver: zodResolver(SkillSchema),
    defaultValues,
  });

  const proficiency = watch("proficiency");

  const fetchSkills = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiRequest<Skill[]>("/api/skills");
      setSkills(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[admin] Skills load error:", err);
      const message = err instanceof Error ? err.message : "Failed to load skills";
      setError(message);
      toastError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSkills();
  }, [fetchSkills]);

  const categoryOptions = useMemo(() => {
    const dynamic = Array.from(new Set(skills.map((skill) => skill.category)));
    return [
      { label: "All categories", value: "all" },
      ...Array.from(new Set([...categories, ...dynamic])).map((item) => ({
        label: item,
        value: item,
      })),
    ];
  }, [skills]);

  const filteredSkills = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...skills]
      .filter((skill) => {
        const matchesSearch =
          !query ||
          skill.name.toLowerCase().includes(query) ||
          skill.category.toLowerCase().includes(query);
        const matchesCategory = category === "all" || skill.category === category;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sort === "name-asc") return a.name.localeCompare(b.name);
        if (sort === "proficiency-desc") {
          return (b.proficiency ?? 0) - (a.proficiency ?? 0);
        }
        if (sort === "proficiency-asc") {
          return (a.proficiency ?? 0) - (b.proficiency ?? 0);
        }
        return (
          a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
        );
      });
  }, [category, search, skills, sort]);

  const groupedSkills = useMemo(() => {
    return filteredSkills.reduce<Record<string, Skill[]>>((groups, skill) => {
      groups[skill.category] = groups[skill.category] || [];
      groups[skill.category].push(skill);
      return groups;
    }, {});
  }, [filteredSkills]);

  function openCreateForm() {
    setEditingSkill(null);
    reset(defaultValues);
    setFormOpen(true);
  }

  function openEditForm(skill: Skill) {
    setEditingSkill(skill);
    reset({
      name: skill.name || "",
      category: skill.category || "Other",
      proficiency: Number(skill.proficiency ?? 80),
    });
    setFormOpen(true);
  }

  async function onSubmit(values: SkillInput) {
    try {
      await apiRequest("/api/skills", {
        method: editingSkill ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingSkill ? { id: editingSkill.id, ...values } : values,
        ),
      });

      toastSuccess(
        editingSkill ? "Skill updated successfully." : "Skill added successfully.",
      );
      setFormOpen(false);
      setEditingSkill(null);
      reset(defaultValues);
      await fetchSkills();
    } catch (err) {
      console.error("[admin] Skill save error:", err);
      toastError(err instanceof Error ? err.message : "Failed to save skill");
    }
  }

  async function handleDeleteSkill() {
    if (!deleteTarget) return;

    try {
      await apiRequest(`/api/skills?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      setSkills((current) =>
        current.filter((skill) => skill.id !== deleteTarget.id),
      );
      toastSuccess("Skill deleted successfully.");
    } catch (err) {
      console.error("[admin] Skill delete error:", err);
      toastError(err instanceof Error ? err.message : "Failed to delete skill");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skills"
        description="Manage skill categories, names, and proficiency levels."
        action={
          <Button type="button" onClick={openCreateForm} disabled={isLoading}>
            <Plus className="size-4" />
            Add Skill
          </Button>
        }
      />

      <DataToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search skills..."
        category={category}
        onCategoryChange={setCategory}
        categoryOptions={categoryOptions}
        sort={sort}
        onSortChange={setSort}
        sortOptions={[
          { label: "Category A-Z", value: "category-asc" },
          { label: "Name A-Z", value: "name-asc" },
          { label: "Proficiency high to low", value: "proficiency-desc" },
          { label: "Proficiency low to high", value: "proficiency-asc" },
        ]}
        onReset={() => {
          setSearch("");
          setCategory("all");
          setSort("category-asc");
        }}
      />

      {error ? (
        <ErrorState description={error} onRetry={() => void fetchSkills()} />
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : filteredSkills.length === 0 ? (
        <EmptyState
          title={skills.length === 0 ? "No skills yet" : "No skills found"}
          description={
            skills.length === 0
              ? "Add the first skill record."
              : "Adjust search or category filters."
          }
          icon={Wrench}
          action={
            <Button type="button" onClick={openCreateForm}>
              <Plus className="size-4" />
              Add Skill
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSkills).map(([group, items]) => (
            <section key={group} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">{group}</h2>
                <StatusBadge status={`${items.length} item${items.length === 1 ? "" : "s"}`} />
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {items.map((skill) => (
                  <article
                    key={skill.id}
                    className="rounded-lg border bg-card p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">{skill.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {skill.proficiency}% proficiency
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEditForm(skill)}
                          aria-label={`Edit ${skill.name}`}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteTarget(skill)}
                          aria-label={`Delete ${skill.name}`}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${skill.proficiency}%` }}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (isSubmitting) return;
          setFormOpen(open);
          if (!open) {
            setEditingSkill(null);
            reset(defaultValues);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSkill ? "Edit Skill" : "Add Skill"}</DialogTitle>
            <DialogDescription>
              Set the category and proficiency shown in the portfolio.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormSection title="Skill Details">
              <div className="space-y-2">
                <Label htmlFor="name">Skill Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name ? (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  {...register("category")}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                {errors.category ? (
                  <p className="text-sm text-destructive">
                    {errors.category.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="proficiency">Proficiency</Label>
                  <span className="text-sm font-medium">{proficiency}%</span>
                </div>
                <Input
                  id="proficiency"
                  type="range"
                  min={0}
                  max={100}
                  {...register("proficiency", { valueAsNumber: true })}
                />
                {errors.proficiency ? (
                  <p className="text-sm text-destructive">
                    {errors.proficiency.message}
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
                  : editingSkill
                    ? "Save Changes"
                    : "Add Skill"}
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
        title="Delete skill?"
        description={
          deleteTarget
            ? `This will permanently delete "${deleteTarget.name}".`
            : "This action cannot be undone."
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeleteSkill}
      />
    </div>
  );
}
