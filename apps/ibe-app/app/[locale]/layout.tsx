import type { ReactNode } from "react";
import { Providers } from "../providers";

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

  return (
    <Providers>
      <main lang={locale}>{children}</main>
    </Providers>
  );
}
