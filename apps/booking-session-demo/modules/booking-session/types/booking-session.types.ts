export type BookingStep =
  | "search"
  | "flight-selection"
  | "passenger"
  | "ancillary"
  | "payment";

export type PassengerSelection = {
  count: number;
  assistanceNote: string;
};

export type AncillarySelection = {
  category: "Meal" | "Baggage" | "Seat";
  selectionCode: string;
};

export type BookingSession = {
  bookingSessionId: string;
  currentStep: BookingStep;
  passengers?: PassengerSelection;
  ancillary?: AncillarySelection;
  version: number;
  updatedAt: string;
  updatedByTabId: string;
};

export type BookingSessionChange =
  | {
      type: "updated";
      sessionId: string;
      version: number;
      updatedByTabId: string;
    }
  | {
      type: "cleared";
      sessionId: string;
      updatedByTabId: string;
    };
