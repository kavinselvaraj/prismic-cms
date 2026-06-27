import { LocaleSwitcher } from "@/components/locale-switcher";
import { routing } from "@/i18n/routing";
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

  if (!routing.locales.includes(locale as "en")) {
    notFound();
  }

  return (
    <div style={{ padding: "24px" }}>
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
