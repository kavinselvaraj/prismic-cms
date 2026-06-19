import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { routing } from "@/i18n/routing";

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
          <Link href={`/${locale}/flight-select`}>Flight Selection</Link>
        </nav>

        <LocaleSwitcher currentLocale={locale as "en" | "ja"} />
      </header>

      {children}
    </div>
  );
}
