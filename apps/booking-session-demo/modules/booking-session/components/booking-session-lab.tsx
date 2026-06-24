"use client";

import { useEffect, useState } from "react";
import {
  clearBookingSession,
  getBookingSession,
  saveBookingSession,
} from "../services/booking-session-storage";
import {
  broadcastBookingSessionClear,
  broadcastBookingSessionUpdate,
  subscribeToBookingSession,
} from "../services/booking-session-sync";
import type {
  AncillarySelection,
  BookingSession,
  BookingStep,
  PassengerSelection,
} from "../types/booking-session.types";
import { getTabId } from "../utils/tab-id";

const initialPassenger: PassengerSelection = {
  count: 1,
  assistanceNote: "",
};

const initialAncillary: AncillarySelection = {
  category: "Meal",
  selectionCode: "MEAL-STANDARD",
};

export function BookingSessionLab() {
  const [sessionIdInput, setSessionIdInput] = useState("DEMO-BOOKING-001");
  const [activeSessionId, setActiveSessionId] = useState("DEMO-BOOKING-001");
  const [session, setSession] = useState<BookingSession | null>(null);
  const [passenger, setPassenger] = useState(initialPassenger);
  const [ancillary, setAncillary] = useState(initialAncillary);
  const [notice, setNotice] = useState("Open this same session in a second tab to begin.");
  const [tabId, setTabId] = useState("");
  const [sessionUrl, setSessionUrl] = useState("");

  useEffect(() => {
    setTabId(getTabId());

    const querySessionId = new URLSearchParams(window.location.search).get("session");

    if (querySessionId) {
      setActiveSessionId(querySessionId);
      setSessionIdInput(querySessionId);
    }
  }, []);

  useEffect(() => {
    const currentSession = getBookingSession(activeSessionId);
    setSession(currentSession);

    if (currentSession?.passengers) {
      setPassenger(currentSession.passengers);
    }

    if (currentSession?.ancillary) {
      setAncillary(currentSession.ancillary);
    }

    return subscribeToBookingSession(activeSessionId, (nextSession, change) => {
      setSession(nextSession);

      if (nextSession?.passengers) {
        setPassenger(nextSession.passengers);
      }

      if (nextSession?.ancillary) {
        setAncillary(nextSession.ancillary);
      }

      setNotice(
        change.type === "cleared"
          ? "Another tab cleared this booking session."
          : `Updated in another tab. Version ${nextSession?.version ?? change.version} is now applied.`,
      );
    });
  }, [activeSessionId]);

  useEffect(() => {
    setSessionUrl(`${window.location.origin}?session=${activeSessionId}`);
  }, [activeSessionId]);

  async function savePassenger() {
    const nextSession = await saveBookingSession(activeSessionId, {
      currentStep: "ancillary",
      passengers: passenger,
      ancillary: session?.ancillary,
    });

    setSession(nextSession);
    broadcastBookingSessionUpdate(nextSession);
    setNotice(`Passenger update saved locally as version ${nextSession.version}.`);
  }

  async function saveAncillary() {
    const nextSession = await saveBookingSession(activeSessionId, {
      currentStep: "payment",
      passengers: session?.passengers,
      ancillary,
    });

    setSession(nextSession);
    broadcastBookingSessionUpdate(nextSession);
    setNotice(`Ancillary update saved locally as version ${nextSession.version}.`);
  }

  function openSession() {
    const nextSessionId = sessionIdInput.trim() || "DEMO-BOOKING-001";
    setActiveSessionId(nextSessionId);
    setSessionIdInput(nextSessionId);
    setNotice(`Viewing booking session ${nextSessionId}.`);
  }

  function clearSession() {
    clearBookingSession(activeSessionId);
    setSession(null);
    broadcastBookingSessionClear(activeSessionId);
    setNotice("Session cleared in this tab and all other open tabs.");
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Frontend-only booking prototype</p>
          <h1>Booking Session Lab</h1>
          <p className="intro">
            Change passenger or ancillary details in one browser tab, then watch another tab receive the latest shared session.
          </p>
        </div>
        <div className="tab-card">
          <span>Current tab</span>
          <code>{tabId ? tabId.slice(0, 8) : "Loading..."}</code>
        </div>
      </header>

      <section className="session-toolbar" aria-label="Booking session controls">
        <label className="session-input">
          <span>Booking session ID</span>
          <input
            value={sessionIdInput}
            onChange={(event) => setSessionIdInput(event.target.value)}
          />
        </label>
        <button type="button" onClick={openSession}>Open session</button>
        <a className="secondary-action" href={sessionUrl || "#"} target="_blank" rel="noreferrer">
          Open second tab
        </a>
        <button className="danger-action" type="button" onClick={clearSession}>
          Clear session
        </button>
      </section>

      <section className="summary-grid" aria-label="Current booking state">
        <SummaryItem label="Version" value={String(session?.version ?? 0)} />
        <SummaryItem label="Current step" value={formatStep(session?.currentStep ?? "search")} />
        <SummaryItem label="Last update" value={session ? formatDate(session.updatedAt) : "No saved session"} />
        <SummaryItem label="Updated by" value={session ? session.updatedByTabId.slice(0, 8) : "-"} />
      </section>

      <p className="sync-notice" role="status">{notice}</p>

      <section className="workflow-grid">
        <article className="workflow-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Step 1</p>
              <h2>Passenger</h2>
            </div>
            <span className="step-chip">Saves next step: Ancillary</span>
          </div>

          <label>
            Travellers
            <input
              min="1"
              max="9"
              type="number"
              value={passenger.count}
              onChange={(event) => setPassenger((current) => ({
                ...current,
                count: Number(event.target.value) || 1,
              }))}
            />
          </label>
          <label>
            Assistance note
            <input
              placeholder="Optional, non-sensitive demo note"
              value={passenger.assistanceNote}
              onChange={(event) => setPassenger((current) => ({
                ...current,
                assistanceNote: event.target.value,
              }))}
            />
          </label>
          <button type="button" onClick={() => void savePassenger()}>
            Save passenger update
          </button>
        </article>

        <article className="workflow-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Step 2</p>
              <h2>Ancillary</h2>
            </div>
            <span className="step-chip">Saves next step: Payment review</span>
          </div>

          <label>
            Category
            <select
              value={ancillary.category}
              onChange={(event) => setAncillary((current) => ({
                ...current,
                category: event.target.value as AncillarySelection["category"],
              }))}
            >
              <option>Meal</option>
              <option>Baggage</option>
              <option>Seat</option>
            </select>
          </label>
          <label>
            Selection code
            <input
              value={ancillary.selectionCode}
              onChange={(event) => setAncillary((current) => ({
                ...current,
                selectionCode: event.target.value,
              }))}
            />
          </label>
          <button type="button" onClick={() => void saveAncillary()}>
            Save ancillary update
          </button>
        </article>
      </section>

      <section className="session-details">
        <div>
          <p className="panel-kicker">Shared browser record</p>
          <h2>Session snapshot</h2>
          <p>
            This is shared only across tabs on the same browser, origin, and device. It intentionally excludes payment and identity data.
          </p>
        </div>
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </section>
    </main>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function formatStep(step: BookingStep) {
  return step.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
