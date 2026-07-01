import { z } from "zod";

export const profileFormSchema = z.object({
  displayName: z.string().trim().min(1, "Display name is required").max(50),
  avatarUrl: z
    .union([z.string().trim().url("Enter a valid URL"), z.literal("")])
    .optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
