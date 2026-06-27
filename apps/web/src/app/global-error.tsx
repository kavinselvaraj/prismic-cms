"use client";

import "./styles.css";
import { AppErrorFallback } from "@/components/app-error-fallback";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto max-w-4xl px-6 py-10">
          <AppErrorFallback
            error={error}
            homeHref="/"
            onRetry={reset}
            retryLabel="Reload app"
            title="Application error"
          />
        </main>
      </body>
    </html>
  );
}
