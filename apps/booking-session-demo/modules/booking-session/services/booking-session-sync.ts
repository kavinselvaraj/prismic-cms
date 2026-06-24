import type {
  BookingSession,
  BookingSessionChange,
} from "../types/booking-session.types";
import { getTabId } from "../utils/tab-id";
import {
  getBookingSession,
  isBookingSessionStorageKey,
} from "./booking-session-storage";

const CHANNEL_NAME = "booking-session-demo";

/** Broadcasts a lightweight notice after the current tab writes session data. */
export function broadcastBookingSessionUpdate(session: BookingSession) {
  postChange({
    type: "updated",
    sessionId: session.bookingSessionId,
    version: session.version,
    updatedByTabId: session.updatedByTabId,
  });
}

/** Broadcasts a notice after one tab removes the session. */
export function broadcastBookingSessionClear(sessionId: string) {
  postChange({
    type: "cleared",
    sessionId,
    updatedByTabId: getTabId(),
  });
}

/** Listens through BroadcastChannel and the storage-event fallback. */
export function subscribeToBookingSession(
  sessionId: string,
  onSessionChange: (session: BookingSession | null, change: BookingSessionChange) => void,
) {
  const handleChange = (change: BookingSessionChange) => {
    if (change.sessionId !== sessionId || change.updatedByTabId === getTabId()) {
      return;
    }

    onSessionChange(change.type === "cleared" ? null : getBookingSession(sessionId), change);
  };

  const channel = "BroadcastChannel" in window
    ? new BroadcastChannel(CHANNEL_NAME)
    : null;
  const channelHandler = (event: MessageEvent<BookingSessionChange>) => {
    handleChange(event.data);
  };
  const storageHandler = (event: StorageEvent) => {
    if (!isBookingSessionStorageKey(sessionId, event.key)) {
      return;
    }

    if (event.newValue) {
      handleChange({
        type: "updated",
        sessionId,
        version: getBookingSession(sessionId)?.version ?? 0,
        updatedByTabId: "storage-event",
      });
      return;
    }

    handleChange({
      type: "cleared",
      sessionId,
      updatedByTabId: "storage-event",
    });
  };

  channel?.addEventListener("message", channelHandler);
  window.addEventListener("storage", storageHandler);

  return () => {
    channel?.removeEventListener("message", channelHandler);
    channel?.close();
    window.removeEventListener("storage", storageHandler);
  };
}

function postChange(change: BookingSessionChange) {
  if (!("BroadcastChannel" in window)) {
    return;
  }

  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage(change);
  channel.close();
}
