"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toastError, toastSuccess } from "@/components/ui/toast-utils";

interface Experience {
  id: number;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
  order: number;
}

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    startDate: "",
    endDate: "",
    currentlyWorking: false,
    description: "",
    order: 0,
  });

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const res = await fetch("/api/experience");
      const data = await res.json();
      if (res.ok) {
        if (Array.isArray(data)) {
          const sorted = [...data].sort((a, b) => b.order - a.order);
          setExperiences(sorted);
        }
      } else {
        console.error("[v0] Error fetching experiences:", data);
      }
    } catch (error) {
      console.error("[v0] Error fetching experiences:", error);
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
    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
            ? parseInt(value) || 0
            : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const method = editingId ? "PUT" : "POST";
      const url = "/api/experience";

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
        await fetchExperiences(); // Refresh the list
        resetForm();
        toastSuccess(
          editingId
            ? "Experience updated successfully."
            : "Experience added successfully.",
        );
      } else {
        console.error("[v0] Error saving experience:", data);
        toastError(
          "Error saving experience: " + (data.error || "Unknown error"),
        );
      }
    } catch (error) {
      console.error("[v0] Error saving experience:", error);
      toastError("Error saving experience");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      jobTitle: "",
      company: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      description: "",
      order: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (exp: Experience) => {
    setFormData({
      jobTitle: exp.jobTitle,
      company: exp.company,
      startDate: exp.startDate,
      endDate: exp.endDate,
      currentlyWorking: exp.currentlyWorking,
      description: exp.description,
      order: exp.order,
    });
    setEditingId(exp.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this experience?")) return;

    try {
      const res = await fetch(`/api/experience?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        await fetchExperiences(); // Refresh the list
        toastSuccess("Experience deleted successfully.");
      } else {
        console.error("[v0] Error deleting experience:", data);
        toastError(
          "Error deleting experience: " + (data.error || "Unknown error"),
        );
      }
    } catch (error) {
      console.error("[v0] Error deleting experience:", error);
      toastError("Error deleting experience");
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  };

  return (
    <div className="space-y-8 pt-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Experience
          </h1>
          <p className="text-foreground/60">Manage your work experience</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
          }}
          className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          <Plus size={20} />
          Add Experience
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {editingId ? "Edit Experience" : "Add New Experience"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title and Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                  placeholder="Senior Developer"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                  placeholder="Tech Company Inc."
                  required
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  disabled={formData.currentlyWorking}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground disabled:opacity-50"
                />
              </div>
            </div>

            {/* Currently Working and Order */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="currentlyWorking"
                  name="currentlyWorking"
                  checked={formData.currentlyWorking}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-border cursor-pointer"
                />
                <label
                  htmlFor="currentlyWorking"
                  className="text-sm font-medium text-foreground cursor-pointer"
                >
                  I currently work here
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                  placeholder="0"
                />
              </div>
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
                placeholder="Describe your responsibilities and achievements..."
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 cursor-pointer px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting && <Spinner className="h-4 w-4" />}
                {editingId ? "Update" : "Add"} Experience
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

      {/* Experience List */}
      <div className="space-y-4">
        {experiences.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <p className="text-foreground/60 mb-4">No experience added yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              <Plus size={18} />
              Add your first experience
            </button>
          </div>
        ) : (
          experiences.map((exp) => (
            <div
              key={exp.id}
              className="bg-card border border-border rounded-xl p-6 border-l-4 border-l-primary"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {exp.jobTitle}
                  </h3>
                  <p className="text-primary font-medium">{exp.company}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(exp)}
                    className="p-2 cursor-pointer text-foreground/60 hover:text-primary transition-colors"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="p-2 cursor-pointer text-foreground/60 hover:text-destructive transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-3">
                <p className="text-sm text-foreground/60">
                  {formatDate(exp.startDate)} {" - "}{" "}
                  {exp.currentlyWorking ? "Present" : formatDate(exp.endDate)}
                </p>
                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                  Order: {exp.order}
                </span>
              </div>

              {exp.description && (
                <p className="text-foreground/70">{exp.description}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
