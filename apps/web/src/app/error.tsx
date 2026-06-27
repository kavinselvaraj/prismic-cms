"use client";

import { AppErrorFallback } from "@/components/app-error-fallback";

type AppErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: AppErrorProps) {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <AppErrorFallback
        error={error}
        homeHref="/"
        onRetry={reset}
        retryLabel="Reload app"
        title="Application error"
      />
    </main>
  );
}
