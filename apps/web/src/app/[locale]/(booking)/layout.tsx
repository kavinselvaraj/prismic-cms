import type { ReactNode } from "react";
import { BookingJourneyStepper } from "@/components/booking-journey-stepper";
import type { AppLocale } from "@/i18n/routing";

type BookingLayoutProps = {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

/**
 * Shared booking layout for booking-flow routes only.
 */
export default async function BookingLayout({
  children,
  params,
}: BookingLayoutProps) {
  const { locale } = await params;

  return (
    <>
      <BookingJourneyStepper locale={locale as AppLocale} />
      {children}
    </>
  );
}
