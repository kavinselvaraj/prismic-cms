import { FC } from "react";
import { SliceComponentProps, PrismicRichText } from "@prismicio/react";

export type CtaBannerProps = SliceComponentProps<any>;

const CtaBanner: FC<CtaBannerProps> = ({ slice }) => {
  const primary = (slice.primary ?? {}) as {
    body?: unknown;
    href?: string | null;
    label?: string | null;
  };

  return (
    <section
      className="mt-14"
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <div className="prose prose-slate mx-auto max-w-3xl text-center">
        <PrismicRichText field={primary.body as never} />
      </div>
      {primary.label ? (
        <div className="mt-8 flex justify-center">
          <a
            className="inline-flex min-h-16 min-w-[27rem] items-center justify-center rounded-md bg-emerald-700 px-8 text-center text-2xl font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-800"
            href={primary.href || "#"}
          >
            {primary.label}
          </a>
        </div>
      ) : null}
    </section>
  );
};

export default CtaBanner;
