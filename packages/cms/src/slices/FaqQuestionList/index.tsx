import { FC } from "react";
import { SliceComponentProps, PrismicRichText } from "@prismicio/react";

export type FaqQuestionListProps = SliceComponentProps<any>;

const FaqQuestionList: FC<FaqQuestionListProps> = ({ slice }) => {
  const primary = (slice.primary ?? {}) as {
    description?: unknown;
    heading?: unknown;
  };
  const items = ((slice.items ?? []) as Array<{
    href?: string | null;
    question?: string | null;
  }>).filter((item) => item.question);

  return (
    <section
      className="mt-10"
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <div className="prose prose-slate max-w-3xl">
        <PrismicRichText field={primary.heading as never} />
      </div>
      <div className="prose prose-slate mt-4 max-w-3xl text-base">
        <PrismicRichText field={primary.description as never} />
      </div>
      <div className="mt-8 space-y-0 border-t border-slate-200">
        {items.map((item, index) => (
          <a
            key={`${item.question}-${index}`}
            className="flex items-center justify-between border-b border-slate-200 py-7 text-lg text-slate-950 transition hover:text-teal-700"
            href={item.href || "#"}
          >
            <span>{item.question}</span>
            <span aria-hidden="true" className="text-3xl leading-none text-teal-700">
              &#8250;
            </span>
          </a>
        ))}
      </div>
    </section>
  );
};

export default FaqQuestionList;
