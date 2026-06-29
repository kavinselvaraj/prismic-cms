import { LocaleSwitcher } from "@/components/locale-switcher";
import { routing } from "@/i18n/routing";
import { getCmsPreviewState } from "@/prismic/preview";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  const preview = await getCmsPreviewState();

  if (!routing.locales.includes(locale as "en")) {
    notFound();
  }

  return (
    <div style={{ padding: "24px" }}>
      {preview.enabled ? (
        <div
          style={{
            alignItems: "center",
            background: "#fff7ed",
            border: "1px solid #fdba74",
            color: "#9a3412",
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            justifyContent: "space-between",
            marginBottom: "16px",
            padding: "12px 16px",
          }}
        >
          <div>
            <strong>Preview mode is on.</strong>
            {preview.ref ? (
              <span style={{ marginLeft: "8px" }}>
                Ref: <code>{preview.ref.slice(0, 18)}...</code>
              </span>
            ) : null}
          </div>
          <Link
            href={`/api/exit-preview?redirect=/${locale}`}
            style={{
              color: "#9a3412",
              fontWeight: 600,
              textDecoration: "underline",
            }}
          >
            Exit preview
          </Link>
        </div>
      ) : null}
      <header
        style={{
          alignItems: "center",
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <nav style={{ display: "flex", gap: "16px" }}>
          <Link href={`/${locale}`}>Landing</Link>
          <Link href={`/${locale}/flight-search`}>Flight Search</Link>
          <Link href={`/${locale}/flight-selection`}>Flight Selection</Link>
          <Link href={`/${locale}/package-selection`}>Packages</Link>
          <Link href={`/${locale}/ancillary-services`}>Ancillaries</Link>
          <Link href={`/${locale}/customer-information`}>Customer Info</Link>
          <Link href={`/${locale}/confirmation`}>Confirmation</Link>
          <Link href={`/${locale}/country-demo`}>Country Demo</Link>
          <Link href={`/${locale}/sdk-csr-demo`}>SDK CSR Demo</Link>
          <Link href={`/${locale}/sdk-ssr-demo`}>SDK SSR Demo</Link>
          <Link href={`/${locale}/sdk-error-scenarios`}>
            SDK Error Scenarios
          </Link>
          <Link href={`/${locale}/jsonplaceholder/posts`}>Posts API</Link>
          <Link href={`/${locale}/jsonplaceholder/users`}>Users API</Link>
          <Link href={`/${locale}/faq`}>FAQ</Link>
        </nav>

        <LocaleSwitcher currentLocale={locale as "en" | "ja"} />
      </header>
      {children}
    </div>
  );
}
