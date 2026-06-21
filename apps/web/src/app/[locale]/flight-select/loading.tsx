export default function FlightSelectLoading() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-950">
          Loading Flight Results
        </h1>
        <p className="mt-3 text-sm text-slate-700">
          Searching available routes and fares. Please wait.
        </p>
      </div>
    </section>
  );
}
