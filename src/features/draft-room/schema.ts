import { z } from "zod";

export const createDraftSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Give your draft a name (at least 3 characters)")
    .max(40, "Keep the name under 40 characters"),
  draftType: z.enum(["GOAT_XI", "ALL_TIME_XI", "UNDERRATED_XI"], {
    message: "Choose a draft type",
  }),
  managerA: z.string().trim().min(1, "Enter a name").max(20, "Max 20 characters"),
  managerB: z.string().trim().min(1, "Enter a name").max(20, "Max 20 characters"),
});

export type CreateDraftInput = z.infer<typeof createDraftSchema>;

/** Online rooms: the creator supplies only their own name; the opponent joins later. */
export const createOnlineDraftSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Give your draft a name (at least 3 characters)")
    .max(40, "Keep the name under 40 characters"),
  draftType: z.enum(["GOAT_XI", "ALL_TIME_XI", "UNDERRATED_XI"], {
    message: "Choose a draft type",
  }),
  displayName: z.string().trim().min(1, "Enter your name").max(20, "Max 20 characters"),
});

export type CreateOnlineDraftInput = z.infer<typeof createOnlineDraftSchema>;

export const joinDraftSchema = z.object({
  code: z.string().trim().min(1),
  displayName: z.string().trim().min(1, "Enter your name").max(20, "Max 20 characters"),
});
