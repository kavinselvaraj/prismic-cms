import type { AboutPageLabels } from "../../content/about/types";
import type { HomePageLabels } from "../../content/home/types";
import type { SharedLabels } from "../../content/shared/types";

export type AppLocale = "en" | "ja";
export type PageName = "home" | "about";
export type ModelId = "home_page" | "about_page" | "shared_labels";
export type LabelSource = "prismic" | "local";

export type PageLabels<TPage extends PageName> = TPage extends "home"
  ? HomePageLabels & SharedLabels
  : TPage extends "about"
    ? AboutPageLabels & SharedLabels
    : never;

export type GetPageLabelsOptions<TPage extends PageName = PageName> = {
  page: TPage;
  locale: AppLocale;
};

export type { AboutPageLabels, HomePageLabels, SharedLabels };
