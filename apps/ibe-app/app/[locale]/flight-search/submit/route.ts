import { NextResponse } from "next/server";
import { validateFlightSearchForm } from "@/modules/route-search/utils/route-search-validation";
import type { FlightSearchFormValues } from "@/types/search-routes";

const FLIGHT_SEARCH_COOKIE = "flight_search_payload";

type RouteContext = {
  params: Promise<{
    locale: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { locale } = await context.params;
  const formData = await request.formData();
  const flightSelectionBaseUrl =
    process.env.NEXT_PUBLIC_WEB_APP_BASE_URL ?? "http://localhost:3000";

  const values: FlightSearchFormValues = {
    origin: String(formData.get("origin") ?? "").trim().toUpperCase(),
    destination: String(formData.get("destination") ?? "").trim().toUpperCase(),
    departureDate: String(formData.get("departureDate") ?? "").trim(),
    returnDate: String(formData.get("returnDate") ?? "").trim(),
    passengers: {
      adults: Number(formData.get("adults") ?? 0),
      children: Number(formData.get("children") ?? 0),
      infants: Number(formData.get("infants") ?? 0),
    },
    currency: String(formData.get("currency") ?? "").trim().toUpperCase(),
  };

  const errors = validateFlightSearchForm(values);

  if (Object.keys(errors).length > 0) {
    return NextResponse.redirect(new URL(`/${locale}/flight-search`, request.url), {
      status: 303,
    });
  }

  const response = NextResponse.redirect(
    `${flightSelectionBaseUrl}/${locale}/flight-select`,
    { status: 303 },
  );

  response.cookies.set(FLIGHT_SEARCH_COOKIE, JSON.stringify(values), {
    httpOnly: true,
    maxAge: 60 * 30,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
