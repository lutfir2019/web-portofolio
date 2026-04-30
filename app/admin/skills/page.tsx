"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toastError, toastSuccess } from "@/components/ui/toast-utils";

interface Skill {
  id: number;
  name: string;
  category: string;
  proficiency: number;
}

const categories = [
  "Frontend",
  "Backend",
  "Database",
  "Language",
  "Tools",
  "Other",
];

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Frontend",
    proficiency: 100,
  });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await fetch("/api/skills");
      const data = await res.json();
      if (res.ok) {
        setSkills(data);
      } else {
        console.error("[v0] Error fetching skills:", data);
      }
    } catch (error) {
      console.error("[v0] Error fetching skills:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "range" ? parseInt(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const method = editingId ? "PUT" : "POST";
      const url = "/api/skills";

      const payload = editingId ? { id: editingId, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        await fetchSkills();
        resetForm();
        toastSuccess(
          editingId ? "Skill updated successfully." : "Skill added successfully.",
        );
      } else {
        console.error("[v0] Error saving skill:", data);
        toastError("Error saving skill: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("[v0] Error saving skill:", error);
      toastError("Error saving skill");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "Frontend",
      proficiency: 100,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (skill: Skill) => {
    setFormData({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
    });
    setEditingId(skill.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this skill?")) return;

    try {
      const res = await fetch(`/api/skills?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        await fetchSkills();
        toastSuccess("Skill deleted successfully.");
      } else {
        console.error("[v0] Error deleting skill:", data);
        toastError("Error deleting skill: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("[v0] Error deleting skill:", error);
      toastError("Error deleting skill");
    }
  };

  const skillsByCategory = categories
    .map((cat) => ({
      category: cat,
      items: skills.filter((s) => s.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  if (isLoading) {
    return (
      <div className="space-y-8 pt-10">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Skills</h1>
          <p className="text-foreground/60">Manage your professional skills</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Spinner className="h-12 w-12" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Memuat skills...
          </h2>
          <p className="text-foreground/70 max-w-xl mx-auto">
            Sedang mengambil data skills dari database.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Skills</h1>
          <p className="text-foreground/60">Manage your professional skills</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
          }}
          className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          <Plus size={20} />
          Add Skill
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {editingId ? "Edit Skill" : "Add New Skill"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Skill Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                placeholder="React"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 cursor-pointer px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting && <Spinner className="h-4 w-4" />}
                {editingId ? "Update" : "Add"} Skill
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

      {/* Skills by Category */}
      <div className="space-y-8">
        {skillsByCategory.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <p className="text-foreground/60 mb-4">No skills added yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              <Plus size={18} />
              Add your first skill
            </button>
          </div>
        ) : (
          skillsByCategory.map((group) => (
            <div key={group.category}>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                {group.category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items.map((skill) => (
                  <div
                    key={skill.id}
                    className="bg-card border border-border rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-foreground">
                        {skill.name}
                      </h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(skill)}
                          className="p-1 cursor-pointer text-foreground/60 hover:text-primary transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(skill.id)}
                          className="p-1 cursor-pointer text-foreground/60 hover:text-destructive transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
