import { prismicSliceComponents } from "@repo/cms";

export default function SliceSimulatorPage() {
  return (
    <main>
      <h1>Slice Simulator</h1>
      <p>
        Configured slice components:{" "}
        {Object.keys(prismicSliceComponents).join(", ")}
      </p>
    </main>
  );
}
