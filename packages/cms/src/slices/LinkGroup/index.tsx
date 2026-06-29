import { PrismicRichText } from "@prismicio/react";
import type { FC } from "react";
import type { LinkGroupProps } from "../../types/slice.types";

const LinkGroup: FC<LinkGroupProps> = ({ slice }) => {
  const primary = (slice.primary ?? {}) as {
    heading?: unknown;
  };
  const items = (
    (slice.items ?? []) as Array<{
      href?: string | null;
      label?: string | null;
    }>
  ).filter((item) => item.label);

  return (
    <section
      className="mt-10 border-t border-slate-200 pt-10"
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <div className="prose prose-slate max-w-3xl">
        <PrismicRichText field={primary.heading as never} />
      </div>
      <div className="mt-6 flex flex-wrap gap-x-7 gap-y-5 text-[17px]">
        {items.map((item, index) => (
          <a
            key={`${item.label}-${index}`}
            className="font-medium text-teal-700 underline decoration-teal-300 underline-offset-4 hover:text-teal-800"
            href={item.href || "#"}
          >
            {item.label}
          </a>
        ))}
      </div>
    </section>
  );
};

export default LinkGroup;
