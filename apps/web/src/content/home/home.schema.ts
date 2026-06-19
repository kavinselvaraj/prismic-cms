import { z } from "zod";

export const homeSchema = z.object({
  page: z.literal("home"),
  modelId: z.literal("home_page"),
  modelType: z.literal("page"),
  uid: z.literal("home"),
  sections: z.object({
    hero: z.object({
      title: z.string().min(1),
      subtitle: z.string().min(1),
      primaryCta: z.string().min(1),
      secondaryCta: z.string().min(1),
    }),
    popularRoutes: z.object({
      title: z.string().min(1),
      viewAll: z.string().min(1),
    }),
  }),
  seo: z.object({
    metaTitle: z.string().min(1),
    metaDescription: z.string().min(1),
  }),
});
