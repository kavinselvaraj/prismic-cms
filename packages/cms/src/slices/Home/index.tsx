import type { SharedSlice } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

type HomeProps = SliceComponentProps<SharedSlice<"home">>;

const Home = ({ slice }: HomeProps) => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      Placeholder component for {slice.slice_type} (variation: {slice.variation})
      slices.
    </section>
  );
};

export default Home;
