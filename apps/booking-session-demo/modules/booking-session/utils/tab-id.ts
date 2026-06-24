const TAB_ID_KEY = "booking-session-demo:tab-id";

/** Returns a browser-tab-specific identifier without sharing it across tabs. */
export function getTabId() {
  const currentTabId = window.sessionStorage.getItem(TAB_ID_KEY);

  if (currentTabId) {
    return currentTabId;
  }

  const nextTabId = crypto.randomUUID();
  window.sessionStorage.setItem(TAB_ID_KEY, nextTabId);
  return nextTabId;
}
