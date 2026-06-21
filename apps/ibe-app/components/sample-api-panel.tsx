"use client";

import { useEffect } from "react";
import { sampleSearchRoutesRequest } from "@/mock/search-routes.mock";
import { fetchSearchRoutes } from "@/modules/route-search/store/route-search.slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type SampleApiPanelProps = {
  apiSource: "backend" | "mock";
  backendBaseUrl: string;
  locale: string;
};

export function SampleApiPanel({
  apiSource,
  backendBaseUrl,
  locale,
}: SampleApiPanelProps) {
  const dispatch = useAppDispatch();
  const { error, isPending, request, routes } = useAppSelector(
    (state) => state.searchRoutes,
  );

  useEffect(() => {
    if (!isPending && routes) {
      console.log("[client-ui] Redux fulfilled", {
        routeCount: routes.length,
        runtime: "browser",
      });
    }
  }, [isPending, routes]);

  useEffect(() => {
    if (error) {
      console.error("[client-ui] Redux rejected", {
        error,
        runtime: "browser",
      });
    }
  }, [error]);

  function callSearchRoutes() {
    console.log("[client-ui] Dispatch fetchSearchRoutes", {
      locale,
      request: sampleSearchRoutesRequest,
      runtime: "browser",
    });
    dispatch(fetchSearchRoutes({ locale, request: sampleSearchRoutesRequest }));
  }

  return (
    <>
      <div className="panel">
        <h3>1. Request flow</h3>
        <div className="flow-grid">
          <div className="flow-step">
            <span className="flow-step-number">1</span>
            <strong>Client component</strong>
            <p>User clicks the demo button in the browser.</p>
          </div>
          <div className="flow-step">
            <span className="flow-step-number">2</span>
            <strong>Redux thunk</strong>
            <p>
              <code>fetchSearchRoutes</code> dispatches the client-side request.
            </p>
          </div>
          <div className="flow-step">
            <span className="flow-step-number">3</span>
            <strong>Client service</strong>
            <p>Axios calls the localized Next.js API route from the browser.</p>
          </div>
          <div className="flow-step">
            <span className="flow-step-number">4</span>
            <strong>Next.js API route</strong>
            <p>Server-side route handler validates and forwards the payload.</p>
          </div>
          <div className="flow-step">
            <span className="flow-step-number">5</span>
            <strong>Server service</strong>
            <p>Backend or mock data is resolved and mapped into route data.</p>
          </div>
          <div className="flow-step">
            <span className="flow-step-number">6</span>
            <strong>Redux update</strong>
            <p>The final response is stored and rendered back in the UI.</p>
          </div>
        </div>
      </div>

      <div className="panel">
        <h3>2. API demo</h3>
        <div className="panel-header">
          <div>
            <h2>Client API call demo</h2>
            <p className="panel-copy">
              Calls the localized Next.js server API route and stores the final
              response in Redux for the browser UI.
            </p>
          </div>
          <button disabled={isPending} onClick={callSearchRoutes} type="button">
            {isPending ? "Calling..." : "Call API"}
          </button>
        </div>

        <div className="api-summary-grid">
          <div className="api-summary-card">
            <span className="meta-label">Request URL</span>
            <code>POST /{locale}/api/search/routes</code>
          </div>
          <div className="api-summary-card">
            <span className="meta-label">Resolved source</span>
            <span className={`status-pill status-pill-${apiSource}`}>
              {apiSource}
            </span>
          </div>
          <div className="api-summary-card">
            <span className="meta-label">Backend base URL</span>
            <code>{backendBaseUrl}</code>
          </div>
        </div>

        <div className="log-note">
          <strong>Logs to watch:</strong> browser console for client-side
          activity, terminal for Next.js route and server-service activity.
        </div>

        <div className="json-grid">
          <div>
            <h3>Sample request body</h3>
            <pre>{JSON.stringify(sampleSearchRoutesRequest, null, 2)}</pre>
          </div>
          <div>
            <h3>
              {error
                ? "Error response"
                : routes
                  ? "API response"
                  : request
                    ? "Dispatched request"
                    : "Awaiting response"}
            </h3>
            <pre>{JSON.stringify(routes ?? error ?? request ?? {}, null, 2)}</pre>
          </div>
        </div>
      </div>

      <div className="panel-header">
        <div>
          <h3>3. Additional info</h3>
          <p className="panel-copy">
            This demo is intentionally browser-driven. The request starts in the
            client component, goes through Redux and the Next.js API route, then
            returns to Redux before rendering in the UI.
          </p>
          <ul className="info-list">
            <li>Redux is used only in the client-side demo flow.</li>
            <li>The browser triggers the request after the button click.</li>
            <li>The terminal still shows server logs because the API route runs on the server.</li>
          </ul>
        </div>
      </div>
    </>
  );
}
