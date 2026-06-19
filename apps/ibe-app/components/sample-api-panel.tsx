"use client";

import { sampleSearchRoutesRequest } from "@/mock/search-routes.mock";
import { fetchSearchRoutes } from "@/modules/route-search/store/route-search.slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type SampleApiPanelProps = {
  locale: string;
};

export function SampleApiPanel({ locale }: SampleApiPanelProps) {
  const dispatch = useAppDispatch();
  const { error, isPending, request, routes } = useAppSelector(
    (state) => state.searchRoutes,
  );

  function callSearchRoutes() {
    dispatch(fetchSearchRoutes({ locale, request: sampleSearchRoutesRequest }));
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Sample route search</h2>
          <p>
            <code>POST /{locale}/api/search/routes</code>
          </p>
        </div>
        <button disabled={isPending} onClick={callSearchRoutes} type="button">
          {isPending ? "Calling..." : "Call API"}
        </button>
      </div>

      <pre>{JSON.stringify(routes ?? error ?? request, null, 2)}</pre>
    </div>
  );
}
