import { z } from "zod";

export const aboutSchema = z.object({
  page: z.literal("about"),
  modelId: z.literal("about_page"),
  modelType: z.literal("page"),
  uid: z.literal("about"),
  sections: z.object({
    hero: z.object({
      title: z.string().min(1),
      subtitle: z.string().min(1),
    }),
    content: z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    }),
  }),
  seo: z.object({
    metaTitle: z.string().min(1),
    metaDescription: z.string().min(1),
  }),
});
