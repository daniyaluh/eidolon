import { z } from "zod";

export const adminGameFormSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    slug: z
      .string()
      .trim()
      .min(1, "Slug is required")
      .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only"),
    description: z.string().trim().min(1, "Description is required"),
    shortDescription: z.string().trim().min(1, "Short description is required"),
    trailerUrl: z.union([z.string().url("Enter a valid URL"), z.literal("")]).optional(),
    releaseDate: z.string().min(1, "Release date is required"),
    developer: z.string().trim().min(1, "Developer is required"),
    publisher: z.string().trim().min(1, "Publisher is required"),
    genres: z.array(z.string()),
    platforms: z.array(z.string()),
    enableOneTime: z.boolean(),
    priceOneTime: z.number().nonnegative().nullable(),
    enableMonthly: z.boolean(),
    priceMonthly: z.number().nonnegative().nullable(),
    minimumRequirements: z.string().optional(),
    recommendedRequirements: z.string().optional(),
  })
  .refine((data) => data.enableOneTime || data.enableMonthly, {
    message: "Enable at least one pricing option",
    path: ["enableOneTime"],
  })
  .refine((data) => !data.enableOneTime || (data.priceOneTime ?? 0) > 0, {
    message: "Enter a one-time price",
    path: ["priceOneTime"],
  })
  .refine((data) => !data.enableMonthly || (data.priceMonthly ?? 0) > 0, {
    message: "Enter a monthly price",
    path: ["priceMonthly"],
  });

export type AdminGameFormValues = z.infer<typeof adminGameFormSchema>;
