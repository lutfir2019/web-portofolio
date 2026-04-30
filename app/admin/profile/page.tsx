"use client";

import { useEffect, useState } from "react";

import { Plus, Trash2 } from "lucide-react";

import { ProfileInput } from "@/lib/validations";
import { toastError, toastSuccess } from "@/components/ui/toast-utils";

interface SocialLink {
  id: number;
  platform: string;
  url: string;
  order?: number;
}

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileInput>({
    fullName: "Portfolio Admin",
    title: "Web Developer",
    bio: "Passionate about creating beautiful and functional web experiences",
    location: "Indonesia",
    email: "mail@example.com",
    phone: "+62 8XX XXXX XXXX",
    profileImage: "",
  });

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  const [showSocialForm, setShowSocialForm] = useState(false);

  const [newSocial, setNewSocial] = useState({
    platform: "GitHub",
    url: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const [loadingSocial, setLoadingSocial] = useState(true);

  const [loadingDelete, setLoadingDelete] = useState(false);

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

  useEffect(() => {
    loadSocialLinks();
  }, []);

  async function loadSocialLinks() {
    try {
      setLoadingSocial(true);

      const socMedRes = await fetch("/api/social-media");
      const profRes = await fetch("/api/profile");

      const resSocMedData = await socMedRes.json();
      const profData = await profRes.json();

      setSocialLinks(resSocMedData || []);
      setProfileData({
        title: profData?.title || profileData.title,
        bio: profData?.bio || profileData.bio,
        location: profData?.location || profileData.location,
        email: profData?.email || profileData.email,
        phone: profData?.phone || profileData.phone,
        fullName: profData?.fullName || profileData.fullName,
        profileImage: profData?.profileImage || profileData.profileImage,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSocial(false);
    }
  }

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handleProfileImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setProfileData({
        ...profileData,
        profileImage: imageData,
      });
    };

    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: profileData.title,
          bio: profileData.bio,
          location: profileData.location,
          phone: profileData.phone,
          email: profileData.email,
          fullName: profileData.fullName,
          profileImage: profileData.profileImage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      toastSuccess("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      toastError(
        error instanceof Error
          ? error.message
          : "Failed to update profile.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSocialLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSocial.url) return;

    try {
      const res = await fetch("/api/social-media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform: newSocial.platform,
          url: newSocial.url,
          order: socialLinks.length + 1,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      await loadSocialLinks();

      setNewSocial({
        platform: "GitHub",
        url: "",
      });

      setShowSocialForm(false);
      toastSuccess("Social link added successfully.");
    } catch (error) {
      console.error(error);
      toastError(
        error instanceof Error
          ? error.message
          : "Failed to add social link.",
      );
    }
  };

  const handleRemoveSocialLink = async (id: number) => {
    if (loadingDelete) return;

    setLoadingDelete(true);

    try {
      const res = await fetch(`/api/social-media/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      setSocialLinks((prev) => prev.filter((item) => item.id !== id));
      toastSuccess("Social link deleted successfully.");
    } catch (error) {
      console.error(error);
      toastError(
        error instanceof Error ? error.message : "Failed to delete social link.",
      );
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div className="space-y-8 pt-10 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Profile Settings
        </h1>
        <p className="text-foreground/60">Manage your personal information</p>
      </div>

      {/* Personal Information */}
      <form
        onSubmit={handleSaveProfile}
        className="bg-card border border-border rounded-xl p-6"
      >
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Personal Information
        </h2>

        <div className="space-y-6">
          {/* Name and Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={profileData.fullName}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Professional Title
              </label>
              <input
                type="text"
                name="title"
                value={profileData.title}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                placeholder="e.g., Web Developer"
              />
            </div>
          </div>

          {/* Email and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={profileData.location}
              onChange={handleProfileChange}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
              placeholder="City, Country"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleProfileChange}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground min-h-24"
              placeholder="Tell visitors about yourself..."
            />
          </div>

          {/* Profile Image */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Profile Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="w-full text-sm text-foreground file:border file:border-border file:rounded-lg file:px-4 file:py-2 file:bg-background file:text-foreground"
            />
            {profileData.profileImage ? (
              <div className="mt-4 w-full max-w-[220px] overflow-hidden rounded-full border border-border">
                <img
                  src={profileData.profileImage}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="mt-4 w-full max-w-[220px] rounded-full bg-primary/10 border border-border text-center py-16 text-sm text-foreground/70">
                No profile photo uploaded yet
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full cursor-pointer px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity font-medium"
          >
            {isSaving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>

      {/* Social Links */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Social Links</h2>
          <button
            onClick={() => setShowSocialForm(!showSocialForm)}
            className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
          >
            <Plus size={18} />
            Add Link
          </button>
        </div>

        {/* Social Form */}
        {showSocialForm && (
          <form
            onSubmit={handleAddSocialLink}
            className="mb-6 p-4 bg-background border border-border rounded-lg"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Platform
                  </label>
                  <select
                    value={newSocial.platform}
                    onChange={(e) =>
                      setNewSocial({ ...newSocial, platform: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                  >
                    {platforms.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    value={newSocial.url}
                    onChange={(e) =>
                      setNewSocial({ ...newSocial, url: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                    placeholder="https://..."
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 cursor-pointer px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  Add Link
                </button>
                <button
                  type="button"
                  onClick={() => setShowSocialForm(false)}
                  className="flex-1 cursor-pointer px-4 py-2 border border-border rounded-lg hover:bg-card transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {loadingSocial ? (
          <p className="text-foreground/60 text-center py-6">Loading...</p>
        ) : socialLinks.length === 0 ? (
          <p className="text-foreground/60 text-center py-6">
            No social links yet
          </p>
        ) : (
          <div className="space-y-3">
            {socialLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-4 bg-background border border-border rounded-lg"
              >
                <div>
                  <p className="font-medium text-foreground">{link.platform}</p>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {link.url}
                  </a>
                </div>
                <button
                  disabled={loadingDelete}
                  onClick={() => handleRemoveSocialLink(link.id)}
                  className="p-2 cursor-pointer text-foreground/60 hover:text-destructive transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
