import { SliceZone } from "@prismicio/react";
import { SliceSimulator, getSlices } from "@slicemachine/adapter-next/simulator";
import { prismicSliceComponents } from "@repo/cms";

type SliceSimulatorPageProps = {
  searchParams: Promise<{
    state?: string;
  }>;
};

export default async function SliceSimulatorPage({
  searchParams,
}: SliceSimulatorPageProps) {
  const { state } = await searchParams;
  const slices = getSlices(state);

  return (
    <SliceSimulator>
      <SliceZone slices={slices} components={prismicSliceComponents} />
    </SliceSimulator>
  );
}
