"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

type LocaleSwitcherProps = {
  currentLocale: AppLocale;
};

export function LocaleSwitcher({ currentLocale }: LocaleSwitcherProps) {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", gap: "12px" }}>
      {routing.locales.map((supportedLocale) => (
        <Link
          href={replaceLocale(pathname, currentLocale, supportedLocale)}
          key={supportedLocale}
          style={{
            border: "1px solid #cbd5e1",
            padding: "8px 14px",
            textDecoration: "none",
          }}
        >
          {supportedLocale.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}

function replaceLocale(
  pathname: string,
  currentLocale: AppLocale,
  nextLocale: AppLocale,
) {
  if (!pathname.startsWith(`/${currentLocale}`)) {
    return `/${nextLocale}`;
  }

  return pathname.replace(`/${currentLocale}`, `/${nextLocale}`);
}
