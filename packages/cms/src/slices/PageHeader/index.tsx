import { FC } from "react";
import { SliceComponentProps, PrismicRichText } from "@prismicio/react";

export type PageHeaderProps = SliceComponentProps<any>;

const PageHeader: FC<PageHeaderProps> = ({ slice }) => {
  const primary = (slice.primary ?? {}) as {
    description?: unknown;
    eyebrow?: string | null;
    title?: unknown;
  };

  return (
    <section
      className="border-b border-slate-200 pb-8"
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      {primary.eyebrow ? (
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-700">
          {primary.eyebrow}
        </p>
      ) : null}
      <div className="prose prose-slate max-w-3xl">
        <PrismicRichText field={primary.title as never} />
      </div>
      <div className="prose prose-slate mt-4 max-w-3xl text-lg leading-8">
        <PrismicRichText field={primary.description as never} />
      </div>
    </section>
  );
};

export default PageHeader;
