import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { adminGameFormSchema } from "../../lib/validation/adminGame";
import type { AdminGameFormValues } from "../../lib/validation/adminGame";
import type { Game } from "../../types/game";
import type { GameInput } from "../../types/admin";
import { useCreateGame, useUpdateGame } from "../../hooks/mutations/useAdminGameMutations";
import { apiClient, ApiError } from "../../lib/apiClient";
import { TagInput } from "./TagInput";
import { ImageDropzone } from "./ImageDropzone";
import { Spinner } from "../ui/Spinner";

interface GameFormModalProps {
  game: Game | null;
  onClose: () => void;
}

function toDateInput(value: string | undefined): string {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function GameFormModal({ game, onClose }: GameFormModalProps) {
  const isEdit = Boolean(game);
  const createGame = useCreateGame();
  const updateGame = useUpdateGame();

  const [coverFile, setCoverFile] = useState<File[]>([]);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [existingCover, setExistingCover] = useState<string[]>(
    game?.coverUrl ? [game.coverUrl] : []
  );
  const [existingScreenshots, setExistingScreenshots] = useState<string[]>(game?.screenshots ?? []);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AdminGameFormValues>({
    resolver: zodResolver(adminGameFormSchema),
    defaultValues: {
      title: game?.title ?? "",
      slug: game?.slug ?? "",
      description: game?.description ?? "",
      shortDescription: game?.shortDescription ?? "",
      trailerUrl: game?.trailerUrl ?? "",
      releaseDate: toDateInput(game?.releaseDate),
      developer: game?.developer ?? "",
      publisher: game?.publisher ?? "",
      genres: game?.genres ?? [],
      platforms: game?.platforms ?? [],
      enableOneTime: game ? game.priceOneTime !== null : true,
      priceOneTime: game?.priceOneTime ?? null,
      enableMonthly: game ? game.priceMonthly !== null : false,
      priceMonthly: game?.priceMonthly ?? null,
      minimumRequirements: (game?.systemRequirements?.minimum as string) ?? "",
      recommendedRequirements: (game?.systemRequirements?.recommended as string) ?? "",
    },
  });

  async function uploadImages(gameId: string) {
    if (coverFile[0]) {
      await apiClient.upload(`/admin/games/${gameId}/upload-cover`, coverFile[0]);
    }
    for (const file of screenshotFiles) {
      await apiClient.upload(`/admin/games/${gameId}/upload-screenshot`, file);
    }
  }

  async function onSubmit(values: AdminGameFormValues) {
    setServerError(null);

    const payload: GameInput = {
      title: values.title,
      slug: values.slug,
      description: values.description,
      shortDescription: values.shortDescription,
      coverUrl: existingCover[0] ?? "",
      trailerUrl: values.trailerUrl ? values.trailerUrl : null,
      screenshots: existingScreenshots,
      genres: values.genres,
      platforms: values.platforms,
      releaseDate: values.releaseDate,
      developer: values.developer,
      publisher: values.publisher,
      priceOneTime: values.enableOneTime ? values.priceOneTime : null,
      priceMonthly: values.enableMonthly ? values.priceMonthly : null,
      systemRequirements: {
        minimum: values.minimumRequirements || null,
        recommended: values.recommendedRequirements || null,
      },
    };

    try {
      let gameId = game?.id;
      if (isEdit && gameId) {
        await updateGame.mutateAsync({ id: gameId, input: payload });
      } else {
        const created = await createGame.mutateAsync(payload);
        gameId = created.id;
      }

      if (gameId) {
        await uploadImages(gameId);
      }
      onClose();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Failed to save game.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="my-8 w-full max-w-2xl rounded-xl bg-zinc-900 p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{isEdit ? "Edit Game" : "Add Game"}</h2>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Title" error={errors.title?.message}>
              <input {...register("title")} className={inputClass} />
            </Field>
            <Field label="Slug" error={errors.slug?.message}>
              <input {...register("slug")} className={inputClass} />
            </Field>
          </div>

          <Field label="Short description" error={errors.shortDescription?.message}>
            <input {...register("shortDescription")} className={inputClass} />
          </Field>

          <Field label="Description" error={errors.description?.message}>
            <textarea {...register("description")} rows={3} className={inputClass} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Developer" error={errors.developer?.message}>
              <input {...register("developer")} className={inputClass} />
            </Field>
            <Field label="Publisher" error={errors.publisher?.message}>
              <input {...register("publisher")} className={inputClass} />
            </Field>
            <Field label="Release date" error={errors.releaseDate?.message}>
              <input type="date" {...register("releaseDate")} className={inputClass} />
            </Field>
            <Field label="Trailer URL" error={errors.trailerUrl?.message}>
              <input {...register("trailerUrl")} className={inputClass} placeholder="https://..." />
            </Field>
          </div>

          <Controller
            control={control}
            name="genres"
            render={({ field }) => (
              <TagInput label="Genres" value={field.value} onChange={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="platforms"
            render={({ field }) => (
              <TagInput label="Platforms" value={field.value} onChange={field.onChange} />
            )}
          />

          <div className="space-y-3 rounded-lg border border-zinc-800 p-3">
            <p className="text-sm font-medium text-zinc-300">Pricing</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-2 text-sm text-zinc-300">
                  <input type="checkbox" {...register("enableOneTime")} className="accent-white" />
                  One-time price
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("priceOneTime", { setValueAs: (v) => (v === "" ? null : Number(v)) })}
                  className={`${inputClass} mt-1`}
                  placeholder="19.99"
                />
                {errors.priceOneTime && (
                  <p className="text-xs text-red-400">{errors.priceOneTime.message}</p>
                )}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-zinc-300">
                  <input type="checkbox" {...register("enableMonthly")} className="accent-white" />
                  Monthly price
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("priceMonthly", { setValueAs: (v) => (v === "" ? null : Number(v)) })}
                  className={`${inputClass} mt-1`}
                  placeholder="4.99"
                />
                {errors.priceMonthly && (
                  <p className="text-xs text-red-400">{errors.priceMonthly.message}</p>
                )}
              </div>
            </div>
            {errors.enableOneTime && (
              <p className="text-xs text-red-400">{errors.enableOneTime.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Minimum requirements">
              <textarea {...register("minimumRequirements")} rows={2} className={inputClass} />
            </Field>
            <Field label="Recommended requirements">
              <textarea {...register("recommendedRequirements")} rows={2} className={inputClass} />
            </Field>
          </div>

          <ImageDropzone
            label="Cover image"
            files={coverFile}
            onFilesChange={setCoverFile}
            existingUrls={existingCover}
            onRemoveExisting={() => setExistingCover([])}
          />

          <ImageDropzone
            label="Screenshots"
            multiple
            files={screenshotFiles}
            onFilesChange={setScreenshotFiles}
            existingUrls={existingScreenshots}
            onRemoveExisting={(url) =>
              setExistingScreenshots(existingScreenshots.filter((u) => u !== url))
            }
          />

          {serverError && <p className="text-sm text-red-400">{serverError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-60"
            >
              {isSubmitting && <Spinner />}
              {isEdit ? "Save changes" : "Create game"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

const inputClass =
  "w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-white focus:outline-none";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <span className="block text-sm font-medium text-zinc-300">{label}</span>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
