import type { Content, SharedSlice } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

export type HeroSectionLabels = {
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
};

export type HeroSectionProps = {
  labels?: HeroSectionLabels;
};

export type PopularRoutesLabels = {
  title?: string;
  viewAll?: string;
};

export type PopularRoutesProps = {
  labels?: PopularRoutesLabels;
};

export type CtaBannerProps = SliceComponentProps<SharedSlice<"cta_banner">>;

export type FaqQuestionListProps = SliceComponentProps<
  SharedSlice<"faq_question_list">
>;

export type LinkGroupProps = SliceComponentProps<SharedSlice<"link_group">>;

export type PageHeaderProps = SliceComponentProps<SharedSlice<"page_header">>;

export type RichTextProps = SliceComponentProps<Content.RichTextSlice>;

export type RichTextSectionProps =
  SliceComponentProps<Content.RichTextSectionSlice>;
