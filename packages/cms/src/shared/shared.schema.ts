import { z } from "zod";

export const sharedSchema = z.object({
  modelId: z.literal("shared_labels"),
  modelType: z.literal("custom"),
  common: z.object({
    buttons: z.object({
      search: z.string().min(1),
      submit: z.string().min(1),
      cancel: z.string().min(1),
      continue: z.string().min(1),
    }),
    validation: z.object({
      required: z.string().min(1),
    }),
  }),
});
