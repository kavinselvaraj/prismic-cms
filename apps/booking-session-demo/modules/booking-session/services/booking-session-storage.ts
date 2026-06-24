import type { BookingSession } from "../types/booking-session.types";
import { getTabId } from "../utils/tab-id";

type BookingSessionPatch = Omit<
  BookingSession,
  "bookingSessionId" | "version" | "updatedAt" | "updatedByTabId"
>;

function getStorageKey(sessionId: string) {
  return `booking-session-demo:${sessionId}`;
}

/** Reads the latest shared session snapshot for one booking session. */
export function getBookingSession(sessionId: string): BookingSession | null {
  const rawValue = window.localStorage.getItem(getStorageKey(sessionId));

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as BookingSession;
  } catch {
    return null;
  }
}

/** Writes an updated session with a monotonically increasing version number. */
export async function saveBookingSession(
  sessionId: string,
  patch: BookingSessionPatch,
): Promise<BookingSession> {
  return withBookingWriteLock(sessionId, () => {
    const currentSession = getBookingSession(sessionId);
    const nextSession: BookingSession = {
      ...currentSession,
      ...patch,
      bookingSessionId: sessionId,
      version: (currentSession?.version ?? 0) + 1,
      updatedAt: new Date().toISOString(),
      updatedByTabId: getTabId(),
    };

    window.localStorage.setItem(getStorageKey(sessionId), JSON.stringify(nextSession));
    return nextSession;
  });
}

/** Removes one shared booking session without affecting other demo sessions. */
export function clearBookingSession(sessionId: string) {
  window.localStorage.removeItem(getStorageKey(sessionId));
}

/** Identifies storage events that belong to one booking session. */
export function isBookingSessionStorageKey(sessionId: string, key: string | null) {
  return key === getStorageKey(sessionId);
}

async function withBookingWriteLock<T>(
  sessionId: string,
  write: () => T,
): Promise<T> {
  if (!navigator.locks) {
    return write();
  }

  return navigator.locks.request(`booking-session-demo:${sessionId}`, write);
}
