import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "../store/authStore";
import { apiClient, ApiError } from "../lib/apiClient";
import { profileFormSchema } from "../lib/validation/profile";
import type { ProfileFormValues } from "../lib/validation/profile";
import type { User } from "../types/user";
import { Spinner } from "../components/ui/Spinner";

const MAX_AVATAR_BYTES = 8 * 1024 * 1024; // 8 MB (matches the server limit)

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.2" />
    </svg>
  );
}

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.displayName ?? "",
      avatarUrl: user?.avatarUrl ?? "",
    },
  });

  if (!user) return null;

  const avatarSrc = user.avatarUrl ?? `https://api.dicebear.com/9.x/identicon/svg?seed=${user.id}`;

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;

    setFormError(null);
    setSuccessMessage(null);

    if (!file.type.startsWith("image/")) {
      setFormError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setFormError("Image is too large (max 8 MB).");
      return;
    }

    setUploading(true);
    try {
      // Uploads the file, stores it, and saves the new URL to the user.
      const updated = await apiClient.upload<User>("/me/avatar", file);
      updateUser(updated);
      // Keep the form's URL field in sync so a later "Save" doesn't undo it.
      setValue("avatarUrl", updated.avatarUrl ?? "");
      setSuccessMessage("Avatar updated.");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(values: ProfileFormValues) {
    setFormError(null);
    setSuccessMessage(null);
    try {
      const updated = await apiClient.patch<User>("/me", {
        displayName: values.displayName,
        avatarUrl: values.avatarUrl ? values.avatarUrl : null,
      });
      updateUser(updated);
      setSuccessMessage("Profile updated.");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to update profile.");
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">Account</p>
      <h1 className="text-display mt-1 text-3xl font-bold text-white">Your profile</h1>

      <div className="surface mt-6 rounded-2xl p-6">
        {/* Avatar + identity */}
        <div className="flex items-center gap-5">
          <label
            className="group relative h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded-full ring-2 ring-white/10 transition hover:ring-white/30"
            title="Change avatar"
          >
            <img src={avatarSrc} alt={user.displayName} className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {uploading ? <Spinner className="h-5 w-5" /> : <CameraIcon />}
              <span className="text-[10px] font-medium uppercase tracking-wide">
                {uploading ? "Uploading" : "Change"}
              </span>
            </div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={uploading}
            />
          </label>

          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-white">{user.displayName}</p>
            <p className="truncate text-sm text-zinc-400">{user.email}</p>
            <p className="mt-1 text-xs text-zinc-500">Click the avatar to upload a new photo</p>
          </div>
        </div>

        <div className="my-6 h-px bg-white/10" />

        {/* Editable fields */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">Display name</label>
            <input
              {...register("displayName")}
              className="glass-soft w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            {errors.displayName?.message && (
              <p className="mt-1.5 text-xs text-red-400">{errors.displayName.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Avatar image URL <span className="text-zinc-500">(optional)</span>
            </label>
            <input
              {...register("avatarUrl")}
              placeholder="https://… or just upload above"
              className="glass-soft w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            {errors.avatarUrl?.message && (
              <p className="mt-1.5 text-xs text-red-400">{errors.avatarUrl.message}</p>
            )}
          </div>

          {formError && <p className="text-sm text-red-400">{formError}</p>}
          {successMessage && <p className="text-sm text-emerald-400">{successMessage}</p>}

          <button
            type="submit"
            disabled={isSubmitting || uploading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && <Spinner />}
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
