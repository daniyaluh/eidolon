import { z } from "zod";

export const reviewFormSchema = z.object({
  rating: z.number().int().min(1, "Please select a rating").max(5),
  title: z.string().trim().min(1, "Title is required").max(120),
  body: z.string().trim().min(1, "Review text is required").max(5000),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;
