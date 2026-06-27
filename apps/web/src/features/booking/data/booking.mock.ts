import type {
  AncillaryOption,
  BundleOption,
  SeatOption,
  SelectedFlight,
  ServiceOption,
} from "../types/booking.types";

export const airportOptions = [
  { code: "SIN", label: "Singapore" },
  { code: "NRT", label: "Tokyo Narita" },
  { code: "BLR", label: "Bengaluru" },
  { code: "DEL", label: "Delhi" },
  { code: "DXB", label: "Dubai" },
];

export const mockFlights: SelectedFlight[] = [
  {
    aircraft: "Boeing 787-9",
    airline: "Zenith Global",
    arrivalDateTime: "2026-07-10T18:00:00+09:00",
    departureDateTime: "2026-07-10T10:00:00+08:00",
    destination: "NRT",
    duration: "7h 00m",
    flightId: "ZG-101",
    flightNumber: "ZG101",
    lfid: "LF-OUT-101",
    origin: "SIN",
    pfid: "PF-OUT-101",
    price: 250,
    segmentType: "OUTBOUND",
  },
  {
    aircraft: "Airbus A350-900",
    airline: "Zenith Global",
    arrivalDateTime: "2026-07-10T21:20:00+09:00",
    departureDateTime: "2026-07-10T13:25:00+08:00",
    destination: "NRT",
    duration: "6h 55m",
    flightId: "ZG-111",
    flightNumber: "ZG111",
    lfid: "LF-OUT-111",
    origin: "SIN",
    pfid: "PF-OUT-111",
    price: 285,
    segmentType: "OUTBOUND",
  },
  {
    aircraft: "Boeing 787-9",
    airline: "Zenith Global",
    arrivalDateTime: "2026-07-20T17:30:00+08:00",
    departureDateTime: "2026-07-20T11:00:00+09:00",
    destination: "SIN",
    duration: "7h 30m",
    flightId: "ZG-102",
    flightNumber: "ZG102",
    lfid: "LF-RET-102",
    origin: "NRT",
    pfid: "PF-RET-102",
    price: 260,
    segmentType: "RETURN",
  },
  {
    aircraft: "Airbus A350-900",
    airline: "Zenith Global",
    arrivalDateTime: "2026-07-20T23:10:00+08:00",
    departureDateTime: "2026-07-20T16:40:00+09:00",
    destination: "SIN",
    duration: "7h 30m",
    flightId: "ZG-112",
    flightNumber: "ZG112",
    lfid: "LF-RET-112",
    origin: "NRT",
    pfid: "PF-RET-112",
    price: 300,
    segmentType: "RETURN",
  },
];

export const bundleOptions: BundleOption[] = [
  {
    code: "VALUE",
    description: "Checked bag, standard seat, and basic change rules.",
    name: "Value Bundle",
    price: 30,
  },
  {
    code: "PREMIUM",
    description: "Preferred seat, extra baggage, and priority support.",
    name: "Premium Bundle",
    price: 45,
  },
  {
    code: "FLEX",
    description: "Flexible changes, premium seat choice, and extra baggage.",
    name: "Flex Bundle",
    price: 60,
  },
  {
    code: "NO_BUNDLE",
    description: "No bundle. Select services separately.",
    name: "No Bundle",
    price: 0,
  },
];

export const seatOptions: SeatOption[] = [
  { price: 15, seatNumber: "12A" },
  { price: 15, seatNumber: "12B" },
  { price: 15, seatNumber: "14C" },
  { price: 20, seatNumber: "6D" },
];

export const ancillaryOptions: AncillaryOption[] = [
  { code: "BAG20", name: "20kg Baggage", price: 40 },
  { code: "BAG30", name: "30kg Baggage", price: 60 },
  { code: "SPORTS", name: "Sports Equipment", price: 75 },
];

export const serviceOptions: ServiceOption[] = [
  {
    chargeable: true,
    code: "VGML",
    name: "Veg Meal",
    price: 12,
    serviceType: "MEAL",
  },
  {
    chargeable: true,
    code: "BBML",
    name: "Baby Meal",
    price: 10,
    serviceType: "MEAL",
  },
  {
    chargeable: false,
    code: "WCHR",
    name: "Wheelchair Assistance",
    price: 0,
    serviceType: "NON_CHARGEABLE_SSR",
  },
];
