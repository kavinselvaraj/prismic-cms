import { PrismicRichText } from "@prismicio/react";
import type { RichTextSectionProps } from "../../types/slice.types";

export function RichTextSection({ slice }: RichTextSectionProps) {
  return (
    <section
      className="mt-10 border-t border-slate-200 pt-10"
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      {slice.primary.title?.length ? (
        <div className="prose prose-slate max-w-3xl">
          <PrismicRichText field={slice.primary.title} />
        </div>
      ) : null}
      {slice.primary.description?.length ? (
        <div className="prose prose-slate mt-4 max-w-3xl text-lg leading-8">
          <PrismicRichText field={slice.primary.description} />
        </div>
      ) : null}
    </section>
  );
}

export default RichTextSection;
