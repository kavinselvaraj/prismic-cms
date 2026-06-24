const MINIMUM_SELECTION_LEAD_TIME_HOURS = 48;

export type FlightTimeOffer = {
  arrivalAirport: string;
  arrivalTimeOffset: string;
  arrivalTimeZone: string;
  departureAirport: string;
  departureTimeOffset: string;
  departureTimeZone: string;
  flightNumber: string;
  id: string;
};

/**
 * Returns whether a flight may show its selectable field based on its departure
 * instant. The offset in the API timestamp makes the comparison timezone-safe.
 */
export function isFlightSelectionEligible(
  departureTimeOffset: string,
  now = Date.now(),
) {
  const departureTime = Date.parse(departureTimeOffset);

  return (
    Number.isFinite(departureTime) &&
    departureTime - now >= MINIMUM_SELECTION_LEAD_TIME_HOURS * 60 * 60 * 1000
  );
}

/** Formats one timestamp in the airport's local timezone for UI display. */
export function formatAirportLocalTime(
  departureTimeOffset: string,
  timeZone: string,
  locale: string,
) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(new Date(departureTimeOffset));
}

/** Returns a readable lead-time value for explanatory UI only. */
export function getHoursUntilDeparture(
  departureTimeOffset: string,
  now = Date.now(),
) {
  const departureTime = Date.parse(departureTimeOffset);

  if (!Number.isFinite(departureTime)) {
    return 0;
  }

  return Math.max(0, Math.floor((departureTime - now) / (60 * 60 * 1000)));
}

/**
 * Creates static demo offers relative to the current time so the below/above
 * 48-hour behaviour remains demonstrable on any day.
 */
export function createStaticSinToUsaOffers(now = Date.now()): FlightTimeOffer[] {
  return [
    {
      id: "sin-lax-36h",
      flightNumber: "DEMO 801",
      departureAirport: "SIN",
      departureTimeZone: "Asia/Singapore",
      arrivalAirport: "LAX",
      arrivalTimeZone: "America/Los_Angeles",
      arrivalTimeOffset: toOffsetDateTime(
        new Date(now + 51 * 60 * 60 * 1000),
        "America/Los_Angeles",
      ),
      departureTimeOffset: toOffsetDateTime(
        new Date(now + 36 * 60 * 60 * 1000),
        "Asia/Singapore",
      ),
    },
    {
      id: "sin-sfo-60h",
      flightNumber: "DEMO 803",
      departureAirport: "SIN",
      departureTimeZone: "Asia/Singapore",
      arrivalAirport: "SFO",
      arrivalTimeZone: "America/Los_Angeles",
      arrivalTimeOffset: toOffsetDateTime(
        new Date(now + 75 * 60 * 60 * 1000),
        "America/Los_Angeles",
      ),
      departureTimeOffset: toOffsetDateTime(
        new Date(now + 60 * 60 * 60 * 1000),
        "Asia/Singapore",
      ),
    },
  ];
}

function toOffsetDateTime(date: Date, timeZone: string) {
  const dateParts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone,
    year: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);
  const parts = Object.fromEntries(
    dateParts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  const zonedTimestamp = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  const offsetMinutes = Math.round((zonedTimestamp - date.getTime()) / 60000);
  const offsetSign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteOffsetMinutes = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(absoluteOffsetMinutes / 60)).padStart(2, "0");
  const offsetRemainderMinutes = String(absoluteOffsetMinutes % 60).padStart(2, "0");

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${offsetSign}${offsetHours}:${offsetRemainderMinutes}`;
}
