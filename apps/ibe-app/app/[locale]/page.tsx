import { SampleApiPanel } from "@/components/sample-api-panel";
import { sampleSearchRoutesRequest } from "@/mock/search-routes.mock";
import { searchRoutesServerService } from "@/modules/route-search/services/route-search.server.service";
import { getApiErrorMessage } from "@/modules/utils/common/api-error";

type LocalePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function LocalePage({ params }: LocalePageProps) {
  const { locale } = await params;
  const apiSource = process.env.API_SOURCE === "backend" ? "backend" : "mock";
  const backendBaseUrl =
    process.env.BACKEND_API_BASE_URL ?? "http://localhost:4000";
  let serverRoutes = null;
  let serverError: string | null = null;

  try {
    console.log("[page-server] Starting server-side demo call", {
      locale,
      request: sampleSearchRoutesRequest,
      runtime: "server",
    });
    serverRoutes = await searchRoutesServerService(sampleSearchRoutesRequest);
    console.log("[page-server] Server-side demo call completed", {
      locale,
      routeCount: serverRoutes.length,
      runtime: "server",
    });
  } catch (error) {
    serverError = getApiErrorMessage(error, "Unable to load server demo");
    console.error("[page-server] Server-side demo call failed", {
      error: serverError,
      locale,
      runtime: "server",
    });
  }

  return (
    <section className="shell">
      <div className="hero-block">
        <div>
          <p className="eyebrow">IBE app</p>
          <h1>Server API Demo and Client API Demo</h1>
          <p className="hero-copy">
            This page separates the two patterns clearly for the team:
            server-rendered API calls and client-triggered API calls. They use
            the same server service, but their request lifecycles are different.
          </p>
        </div>

        <div className="hero-meta">
          <div className="hero-meta-row">
            <span className="meta-label">API source</span>
            <span className={`status-pill status-pill-${apiSource}`}>
              {apiSource}
            </span>
          </div>
          <div className="hero-meta-row">
            <span className="meta-label">Backend base URL</span>
            <code>{backendBaseUrl}</code>
          </div>
          <div className="hero-meta-row">
            <span className="meta-label">Locale route</span>
            <code>/{locale}/api/search/routes</code>
          </div>
        </div>
      </div>

      <section className="demo-section">
        <div className="demo-section-header">
          <div>
            <p className="section-eyebrow">Section A</p>
            <h2>Server API Demo</h2>
          </div>
          <span className="status-pill status-pill-backend">server only</span>
        </div>

        <div className="panel">
          <h3>1. Request flow</h3>
          <div className="flow-grid">
            <div className="flow-step">
              <span className="flow-step-number">1</span>
              <strong>Server page render</strong>
              <p>
                <code>app/[locale]/page.tsx</code> starts the request while rendering.
              </p>
            </div>
            <div className="flow-step">
              <span className="flow-step-number">2</span>
              <strong>Server service</strong>
              <p>
                <code>searchRoutesServerService()</code> calls backend or mock data.
              </p>
            </div>
            <div className="flow-step">
              <span className="flow-step-number">3</span>
              <strong>HTML response</strong>
              <p>The resolved data is embedded in the server-rendered page output.</p>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>2. API demo</h3>
              <p className="panel-copy">
                This request is executed on the server before HTML is returned to
                the browser. It does not go through Redux and does not start from a
                browser click.
              </p>
            </div>
            <span className="status-pill status-pill-backend">SSR call</span>
          </div>

          <div className="api-summary-grid">
            <div className="api-summary-card">
              <span className="meta-label">Execution place</span>
              <code>app/[locale]/page.tsx</code>
            </div>
            <div className="api-summary-card">
              <span className="meta-label">Service</span>
              <code>searchRoutesServerService()</code>
            </div>
            <div className="api-summary-card">
              <span className="meta-label">Logs to watch</span>
              <code>Next.js terminal only</code>
            </div>
          </div>

          <div className="json-grid">
            <div>
              <h3>Sample request body</h3>
              <pre>{JSON.stringify(sampleSearchRoutesRequest, null, 2)}</pre>
            </div>
            <div>
              <h3>{serverError ? "Server error" : "Server response"}</h3>
              <pre>
                {JSON.stringify(
                  serverError ? { error: serverError } : serverRoutes,
                  null,
                  2,
                )}
              </pre>
            </div>
          </div>
        </div>

        <div className="panel">
          <h3>3. Additional info</h3>
          <p className="panel-copy">
            This demo is strictly server-side. The browser receives already
            prepared HTML and JSON output from the server render.
          </p>
          <ul className="info-list">
            <li>Redux is not involved in this flow.</li>
            <li>No client click is needed to trigger the request.</li>
            <li>The logs appear only in the Next.js terminal.</li>
          </ul>
        </div>
      </section>

      <section className="demo-section">
        <div className="demo-section-header">
          <div>
            <p className="section-eyebrow">Section B</p>
            <h2>Client API Demo</h2>
          </div>
          <span className="status-pill status-pill-mock">browser + api route</span>
        </div>

        <SampleApiPanel
          apiSource={apiSource}
          backendBaseUrl={backendBaseUrl}
          locale={locale}
        />
      </section>
    </section>
  );
}
