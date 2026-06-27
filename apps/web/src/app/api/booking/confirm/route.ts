import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json();

  return NextResponse.json(
    {
      bookingReference: `BK-${Date.now()}`,
      receivedPassengerCount: Array.isArray(payload?.passengers)
        ? payload.passengers.length
        : 0,
      status: "CONFIRMED",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
