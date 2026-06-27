"use client";

import { AppErrorFallback } from "@/components/app-error-fallback";
import { usePathname } from "next/navigation";

type LocaleErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LocaleError({ error, reset }: LocaleErrorProps) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <AppErrorFallback
        error={error}
        homeHref={`/${locale}`}
        onRetry={reset}
        retryLabel="Retry"
        title="Something went wrong"
      />
    </main>
  );
}
