import type { FC } from "react";
import type { RichTextProps } from "../../types/slice.types";

/**
 * Component for "RichText" Slices.
 */
const RichText: FC<RichTextProps> = ({ slice }) => {
  return (
    <section
      className="mt-10 border-t border-slate-200 pt-10"
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Configure fields for the <strong>{slice.slice_type}</strong> slice and
        replace this placeholder with the final renderer.
      </div>
    </section>
  );
};

export default RichText;
