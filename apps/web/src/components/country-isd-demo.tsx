"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import type { CountryOption } from "@/utils/country-data";

type CountryIsdDemoProps = {
  locale: "en" | "ja";
  options: CountryOption[];
};

type StepperKey = "adults" | "children" | "infants";

type StepperItem = {
  key: StepperKey;
  label: string;
  description: string;
  min: number;
  max: number;
};

const stepperItems: StepperItem[] = [
  {
    key: "adults",
    label: "Adults",
    description: "12+ years",
    min: 1,
    max: 9,
  },
  {
    key: "children",
    label: "Children",
    description: "2-11 years",
    min: 0,
    max: 8,
  },
  {
    key: "infants",
    label: "Infants",
    description: "Under 2 years",
    min: 0,
    max: 4,
  },
];

/**
 * Returns a stable ISD-sorted dataset so the dropdown opens with a predictable,
 * production-friendly ordering.
 */
function sortCountryOptionsByIsd(options: CountryOption[]): CountryOption[] {
  return [...options].sort((left, right) => {
    const leftCode = Number(left.isdCode.replace("+", ""));
    const rightCode = Number(right.isdCode.replace("+", ""));

    if (leftCode !== rightCode) {
      return leftCode - rightCode;
    }

    return left.countryName.localeCompare(right.countryName);
  });
}

/**
 * Normalizes the ISD code into a digits-only value for numeric lookups.
 */
function normalizeIsdCode(isdCode: string): string {
  return isdCode.replace(/\D/g, "");
}

/**
 * Produces the case-insensitive searchable string used by text-based invisible
 * type-ahead matching.
 */
function createCountrySearchIndex(option: CountryOption): string {
  return `${option.countryName} ${option.countryCode}`.toLowerCase();
}

/**
 * Filters ISD options using the accumulated invisible type-ahead term.
 */
function filterIsdOptions(
  options: CountryOption[],
  searchTerm: string,
): CountryOption[] {
  const normalizedTerm = searchTerm.trim().toLowerCase();

  if (!normalizedTerm) {
    return options;
  }

  const normalizedNumericTerm = normalizedTerm.replace(/\D/g, "");
  const isNumericLookup = /^\+?\d+$/.test(normalizedTerm);

  return options.filter((option) => {
    if (isNumericLookup) {
      return normalizeIsdCode(option.isdCode).startsWith(normalizedNumericTerm);
    }

    return createCountrySearchIndex(option).includes(normalizedTerm);
  });
}

/**
 * Filters country options using the accumulated invisible type-ahead term.
 */
function filterCountryOptions(
  options: CountryOption[],
  searchTerm: string,
): CountryOption[] {
  const normalizedTerm = searchTerm.trim().toLowerCase();

  if (!normalizedTerm) {
    return options;
  }

  return options.filter((option) =>
    createCountrySearchIndex(option).includes(normalizedTerm),
  );
}

/**
 * Extends the current invisible search term with the latest typed character.
 */
function resolveNextSearchTerm(
  currentTerm: string,
  nextCharacter: string,
): string {
  return `${currentTerm}${nextCharacter}`;
}

/**
 * Finds the next highlighted option while keeping navigation inside the current
 * filtered list boundaries.
 */
function moveHighlightedOption(
  options: CountryOption[],
  activeCountryCode: string | null,
  direction: 1 | -1,
): string | null {
  if (!options.length) {
    return null;
  }

  const currentIndex = activeCountryCode
    ? options.findIndex((option) => option.countryCode === activeCountryCode)
    : -1;

  if (currentIndex === -1) {
    return direction === 1
      ? options[0]?.countryCode ?? null
      : options[options.length - 1]?.countryCode ?? null;
  }

  const nextIndex = Math.min(
    options.length - 1,
    Math.max(0, currentIndex + direction),
  );

  return options[nextIndex]?.countryCode ?? null;
}

/**
 * Country and ISD demo page component with a production-style type-ahead
 * dropdown and phone-number field.
 */
export function CountryIsdDemo({ locale, options }: CountryIsdDemoProps) {
  const countryListboxId = useId();
  const isdListboxId = useId();
  const [selectedCountryCode, setSelectedCountryCode] = useState(
    locale === "ja" ? "JP" : "US",
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);
  const [isPhoneMenuOpen, setIsPhoneMenuOpen] = useState(false);
  const [countrySearchTerm, setCountrySearchTerm] = useState("");
  const [isdSearchTerm, setIsdSearchTerm] = useState("");
  const [stepperValues, setStepperValues] = useState<Record<StepperKey, number>>({
    adults: 1,
    children: 0,
    infants: 0,
  });
  const [activeCountryMenuCode, setActiveCountryMenuCode] = useState<string | null>(
    null,
  );
  const [activeCountryCode, setActiveCountryCode] = useState<string | null>(null);
  const countrySelectorRef = useRef<HTMLDivElement | null>(null);
  const phoneSelectorRef = useRef<HTMLDivElement | null>(null);

  const selectedCountry =
    options.find((option) => option.countryCode === selectedCountryCode) ??
    options[0];

  const quickOptions = useMemo(
    () =>
      options.filter((option) =>
        ["JP", "US", "IN", "SG", "TH"].includes(option.countryCode),
      ),
    [options],
  );

  const phoneMenuOptions = useMemo(() => sortCountryOptionsByIsd(options), [options]);
  const countryMenuOptions = useMemo(() => options, [options]);
  const totalTravellers = useMemo(
    () => stepperValues.adults + stepperValues.children + stepperValues.infants,
    [stepperValues],
  );

  const filteredCountryMenuOptions = useMemo(
    () => filterCountryOptions(countryMenuOptions, countrySearchTerm),
    [countryMenuOptions, countrySearchTerm],
  );

  const filteredPhoneMenuOptions = useMemo(
    () => filterIsdOptions(phoneMenuOptions, isdSearchTerm),
    [isdSearchTerm, phoneMenuOptions],
  );

  useEffect(() => {
    if (!isCountryMenuOpen) {
      return;
    }

    if (filteredCountryMenuOptions.length === 0) {
      setActiveCountryMenuCode(null);
      return;
    }

    if (
      activeCountryMenuCode &&
      filteredCountryMenuOptions.some(
        (option) => option.countryCode === activeCountryMenuCode,
      )
    ) {
      return;
    }

    setActiveCountryMenuCode(filteredCountryMenuOptions[0]?.countryCode ?? null);
  }, [activeCountryMenuCode, filteredCountryMenuOptions, isCountryMenuOpen]);

  useEffect(() => {
    if (!isPhoneMenuOpen) {
      return;
    }

    if (filteredPhoneMenuOptions.length === 0) {
      setActiveCountryCode(null);
      return;
    }

    if (
      activeCountryCode &&
      filteredPhoneMenuOptions.some(
        (option) => option.countryCode === activeCountryCode,
      )
    ) {
      return;
    }

    setActiveCountryCode(filteredPhoneMenuOptions[0]?.countryCode ?? null);
  }, [activeCountryCode, filteredPhoneMenuOptions, isPhoneMenuOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!countrySelectorRef.current?.contains(event.target as Node)) {
        closeCountryMenu();
      }

      if (!phoneSelectorRef.current?.contains(event.target as Node)) {
        closePhoneMenu();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /**
   * Opens the country listbox and resets the invisible search buffer.
   */
  function openCountryMenu() {
    setIsCountryMenuOpen(true);
    setCountrySearchTerm("");
    setActiveCountryMenuCode(selectedCountry?.countryCode ?? null);
  }

  /**
   * Closes the country listbox and clears transient search/highlight state.
   */
  function closeCountryMenu() {
    setIsCountryMenuOpen(false);
    setCountrySearchTerm("");
    setActiveCountryMenuCode(null);
  }

  /**
   * Opens the listbox and resets the invisible search buffer.
   */
  function openPhoneMenu() {
    setIsPhoneMenuOpen(true);
    setIsdSearchTerm("");
    setActiveCountryCode(selectedCountry?.countryCode ?? null);
  }

  /**
   * Closes the listbox and clears any transient search/highlight state.
   */
  function closePhoneMenu() {
    setIsPhoneMenuOpen(false);
    setIsdSearchTerm("");
    setActiveCountryCode(null);
  }

  /**
   * Selects the active ISD option and closes the menu.
   */
  function selectCountryOption(countryCode: string) {
    setSelectedCountryCode(countryCode);
    closePhoneMenu();
    closeCountryMenu();
  }

  /**
   * Handles invisible type-ahead for the country dropdown.
   */
  function handleInvisibleCountrySearch(key: string) {
    setIsCountryMenuOpen(true);
    setCountrySearchTerm((current) => resolveNextSearchTerm(current, key));
  }

  /**
   * Handles invisible type-ahead so users can search dropdown values without an
   * explicit search input.
   */
  function handleInvisibleSearch(key: string) {
    setIsPhoneMenuOpen(true);
    setIsdSearchTerm((current) => resolveNextSearchTerm(current, key));
  }

  /**
   * Handles keyboard navigation for the country trigger button.
   */
  function handleCountryTypeAhead(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Backspace") {
      event.preventDefault();
      setIsCountryMenuOpen(true);
      setCountrySearchTerm((current) => current.slice(0, -1));
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeCountryMenu();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (!isCountryMenuOpen) {
        openCountryMenu();
        return;
      }

      setActiveCountryMenuCode((current) =>
        moveHighlightedOption(filteredCountryMenuOptions, current, 1),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      if (!isCountryMenuOpen) {
        openCountryMenu();
        return;
      }

      setActiveCountryMenuCode((current) =>
        moveHighlightedOption(filteredCountryMenuOptions, current, -1),
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      if (!isCountryMenuOpen) {
        openCountryMenu();
        return;
      }

      if (activeCountryMenuCode) {
        selectCountryOption(activeCountryMenuCode);
      }
      return;
    }

    if (event.key === " ") {
      event.preventDefault();

      if (!isCountryMenuOpen) {
        openCountryMenu();
        return;
      }
    }

    if (event.key.length === 1) {
      event.preventDefault();
      handleInvisibleCountrySearch(event.key);
    }
  }

  /**
   * Handles keyboard navigation for the ISD trigger button.
   */
  function handleIsdTypeAhead(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Backspace") {
      event.preventDefault();
      setIsPhoneMenuOpen(true);
      setIsdSearchTerm((current) => current.slice(0, -1));
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closePhoneMenu();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (!isPhoneMenuOpen) {
        openPhoneMenu();
        return;
      }

      setActiveCountryCode((current) =>
        moveHighlightedOption(filteredPhoneMenuOptions, current, 1),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      if (!isPhoneMenuOpen) {
        openPhoneMenu();
        return;
      }

      setActiveCountryCode((current) =>
        moveHighlightedOption(filteredPhoneMenuOptions, current, -1),
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      if (!isPhoneMenuOpen) {
        openPhoneMenu();
        return;
      }

      if (activeCountryCode) {
        selectCountryOption(activeCountryCode);
      }
      return;
    }

    if (event.key === " ") {
      event.preventDefault();

      if (!isPhoneMenuOpen) {
        openPhoneMenu();
      }
      return;
    }

    if (event.key.length === 1) {
      event.preventDefault();
      handleInvisibleSearch(event.key);
    }
  }

  /**
   * Updates one stepper value while enforcing the configured minimum and
   * maximum range.
   */
  function updateStepperValue(key: StepperKey, nextValue: number) {
    const stepperItem = stepperItems.find((item) => item.key === key);

    if (!stepperItem) {
      return;
    }

    const boundedValue = Math.min(stepperItem.max, Math.max(stepperItem.min, nextValue));

    setStepperValues((current) => ({
      ...current,
      [key]: boundedValue,
    }));
  }

  return (
    <main style={{ display: "grid", gap: "24px" }}>
      <section>
        <h1>Country and ISD Demo</h1>
        <p>
          This demo shows a locale-aware country list plus the dialing code
          returned from the phone metadata package.
        </p>
      </section>

      <section style={panelStyle}>
        <div>
          <label
            htmlFor="country-selector"
            style={{ display: "block", fontWeight: 600, marginBottom: "8px" }}
          >
            Country
          </label>
          <div ref={countrySelectorRef} style={{ position: "relative" }}>
            <button
              aria-activedescendant={
                activeCountryMenuCode
                  ? `${countryListboxId}-${activeCountryMenuCode}`
                  : undefined
              }
              aria-controls={countryListboxId}
              aria-expanded={isCountryMenuOpen}
              aria-haspopup="listbox"
              id="country-selector"
              onClick={() => {
                if (isCountryMenuOpen) {
                  closeCountryMenu();
                  return;
                }

                openCountryMenu();
              }}
              onKeyDown={handleCountryTypeAhead}
              style={countryTriggerStyle}
              type="button"
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                {selectedCountry?.countryName} ({selectedCountry?.countryCode})
              </span>
              <span aria-hidden="true" style={chevronStyle(isCountryMenuOpen)}>
                ^
              </span>
            </button>

            {isCountryMenuOpen ? (
              <div id={countryListboxId} role="listbox" style={countryListboxStyle}>
                {filteredCountryMenuOptions.length === 0 ? (
                  <div style={emptyStateStyle}>No matching country found.</div>
                ) : null}

                {filteredCountryMenuOptions.map((option) => {
                  const isSelected = option.countryCode === selectedCountryCode;
                  const isActive = option.countryCode === activeCountryMenuCode;

                  return (
                    <button
                      aria-selected={isSelected}
                      id={`${countryListboxId}-${option.countryCode}`}
                      key={option.countryCode}
                      onClick={() => selectCountryOption(option.countryCode)}
                      onMouseEnter={() => setActiveCountryMenuCode(option.countryCode)}
                      role="option"
                      style={listOptionStyle(isSelected, isActive)}
                      type="button"
                    >
                      <span>
                        {option.countryName} ({option.countryCode})
                      </span>
                      <span
                        aria-hidden={!isSelected}
                        style={selectionBadgeStyle(isSelected)}
                      >
                        v
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        <div style={selectedCountryCardStyle}>
          <p>
            <strong>Selected country:</strong> {selectedCountry?.countryName}
          </p>
          <p>
            <strong>ISO code:</strong> {selectedCountry?.countryCode}
          </p>
          <p>
            <strong>ISD code:</strong> {selectedCountry?.isdCode}
          </p>
        </div>
      </section>

      <section style={{ ...panelStyle, maxWidth: "980px" }}>
        <div>
          <h2 style={{ marginBottom: "8px" }}>ISD with phone number</h2>
          <p style={{ color: "#475569", margin: 0 }}>
            Demo field for the combined dialing code selector and phone input.
          </p>
        </div>

        <div style={{ display: "grid", gap: "10px" }}>
          <label htmlFor="phone-number" style={{ fontWeight: 600 }}>
            Phone number <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <div style={phoneFieldGridStyle}>
            <div ref={phoneSelectorRef} style={{ position: "relative" }}>
              <button
                aria-activedescendant={
                  activeCountryCode ? `${isdListboxId}-${activeCountryCode}` : undefined
                }
                aria-controls={isdListboxId}
                aria-expanded={isPhoneMenuOpen}
                aria-haspopup="listbox"
                onClick={() => {
                  if (isPhoneMenuOpen) {
                    closePhoneMenu();
                    return;
                  }

                  openPhoneMenu();
                }}
                onKeyDown={handleIsdTypeAhead}
                style={isdTriggerStyle}
                type="button"
              >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                  {selectedCountry?.isdCode}
                </span>
                <span aria-hidden="true" style={chevronStyle(isPhoneMenuOpen)}>
                  ^
                </span>
              </button>

              {isPhoneMenuOpen ? (
                <div id={isdListboxId} role="listbox" style={listboxStyle}>
                  {filteredPhoneMenuOptions.length === 0 ? (
                    <div style={emptyStateStyle}>No matching ISD code found.</div>
                  ) : null}

                  {filteredPhoneMenuOptions.map((option) => {
                    const isSelected = option.countryCode === selectedCountryCode;
                    const isActive = option.countryCode === activeCountryCode;

                    return (
                      <button
                        aria-selected={isSelected}
                        id={`${isdListboxId}-${option.countryCode}`}
                        key={option.countryCode}
                        onClick={() => selectCountryOption(option.countryCode)}
                        onMouseEnter={() => setActiveCountryCode(option.countryCode)}
                        role="option"
                        style={listOptionStyle(isSelected, isActive)}
                        type="button"
                      >
                        <span>
                          {option.isdCode} ({option.countryName})
                        </span>
                        <span aria-hidden={!isSelected} style={selectionBadgeStyle(isSelected)}>
                          v
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <input
              id="phone-number"
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="Enter phone number"
              style={phoneInputStyle}
              type="tel"
              value={phoneNumber}
            />
          </div>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
            The dropdown field stays read-only. When it is focused, typing
            filters the dropdown values invisibly without adding a separate
            search box.
          </p>
        </div>
      </section>

      <section>
        <h2>Quick country suggestions</h2>
        <div style={quickOptionsWrapperStyle}>
          {quickOptions.map((option) => (
            <button
              key={option.countryCode}
              onClick={() => setSelectedCountryCode(option.countryCode)}
              style={quickOptionStyle(option.countryCode === selectedCountryCode)}
              type="button"
            >
              {option.countryName} {option.isdCode}
            </button>
          ))}
        </div>
      </section>

      <section style={{ ...panelStyle, maxWidth: "720px" }}>
        <div>
          <h2 style={{ marginBottom: "8px" }}>Passenger stepper demo</h2>
          <p style={{ color: "#475569", margin: 0 }}>
            Demo control for increment and decrement behavior in a booking flow.
          </p>
        </div>

        <div style={stepperSummaryStyle}>
          <strong>Total travellers:</strong> {totalTravellers}
        </div>

        <div style={{ display: "grid", gap: "12px" }}>
          {stepperItems.map((item) => {
            const value = stepperValues[item.key];
            const canDecrease = value > item.min;
            const canIncrease = value < item.max;

            return (
              <div key={item.key} style={stepperRowStyle}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.label}</div>
                  <div style={{ color: "#64748b", fontSize: "14px" }}>
                    {item.description}
                  </div>
                </div>

                <div style={stepperControlStyle}>
                  <button
                    aria-label={`Decrease ${item.label}`}
                    disabled={!canDecrease}
                    onClick={() => updateStepperValue(item.key, value - 1)}
                    style={stepperButtonStyle(!canDecrease)}
                    type="button"
                  >
                    -
                  </button>
                  <div aria-live="polite" style={stepperValueStyle}>
                    {value}
                  </div>
                  <button
                    aria-label={`Increase ${item.label}`}
                    disabled={!canIncrease}
                    onClick={() => updateStepperValue(item.key, value + 1)}
                    style={stepperButtonStyle(!canIncrease)}
                    type="button"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2>Sample dataset</h2>
        <div style={tableWrapperStyle}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead style={{ background: "#f8fafc" }}>
              <tr>
                <th style={cellStyle}>Country</th>
                <th style={cellStyle}>ISO</th>
                <th style={cellStyle}>ISD</th>
              </tr>
            </thead>
            <tbody>
              {phoneMenuOptions.slice(0, 12).map((option) => (
                <tr key={option.countryCode}>
                  <td style={cellStyle}>{option.countryName}</td>
                  <td style={cellStyle}>{option.countryCode}</td>
                  <td style={cellStyle}>{option.isdCode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

const panelStyle: CSSProperties = {
  border: "1px solid #d7dde5",
  borderRadius: "8px",
  display: "grid",
  gap: "20px",
  maxWidth: "520px",
  padding: "20px",
};

const selectedCountryCardStyle: CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "16px",
};

const countryTriggerStyle: CSSProperties = {
  alignItems: "center",
  background: "#ffffff",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  color: "#0f172a",
  cursor: "pointer",
  display: "flex",
  fontSize: "16px",
  fontWeight: 500,
  gap: "10px",
  justifyContent: "space-between",
  minHeight: "44px",
  padding: "0 14px",
  textAlign: "left",
  width: "100%",
};

const phoneFieldGridStyle: CSSProperties = {
  alignItems: "start",
  display: "grid",
  gap: "12px",
  gridTemplateColumns: "220px minmax(0, 1fr)",
  position: "relative",
};

const isdTriggerStyle: CSSProperties = {
  alignItems: "center",
  background: "#ffffff",
  border: "1px solid #197e5c",
  borderRadius: "8px",
  color: "#0f172a",
  cursor: "pointer",
  display: "flex",
  fontSize: "28px",
  fontWeight: 500,
  gap: "10px",
  justifyContent: "space-between",
  minHeight: "56px",
  padding: "0 14px 0 18px",
  textAlign: "left",
  width: "100%",
};

/**
 * Returns the chevron style for the open/closed dropdown state.
 */
function chevronStyle(isOpen: boolean): CSSProperties {
  return {
    color: "#197e5c",
    fontSize: "20px",
    lineHeight: 1,
    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
    transition: "transform 0.2s ease",
  };
}

const listboxStyle: CSSProperties = {
  background: "#ffffff",
  border: "1px solid #197e5c",
  borderRadius: "8px",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
  left: 0,
  marginTop: "8px",
  maxHeight: "320px",
  overflowY: "auto",
  position: "absolute",
  top: "100%",
  width: "320px",
  zIndex: 10,
};

const countryListboxStyle: CSSProperties = {
  ...listboxStyle,
  border: "1px solid #cbd5e1",
  width: "100%",
};

const emptyStateStyle: CSSProperties = {
  color: "#64748b",
  fontSize: "16px",
  minHeight: "72px",
  padding: "24px 18px",
};

/**
 * Builds the visual state for list options, including current highlight and
 * current selection.
 */
function listOptionStyle(
  isSelected: boolean,
  isActive: boolean,
): CSSProperties {
  return {
    alignItems: "center",
    background: isActive ? "#e6fffa" : isSelected ? "#f0fdf4" : "#ffffff",
    border: "none",
    color: "#0f172a",
    cursor: "pointer",
    display: "flex",
    fontSize: "18px",
    justifyContent: "space-between",
    minHeight: "72px",
    padding: "0 18px",
    textAlign: "left",
    width: "100%",
  };
}

/**
 * Returns the badge style for the selected dropdown value.
 */
function selectionBadgeStyle(isSelected: boolean): CSSProperties {
  return {
    alignItems: "center",
    background: isSelected ? "#197e5c" : "transparent",
    borderRadius: "999px",
    color: "#ffffff",
    display: "inline-flex",
    fontSize: "14px",
    fontWeight: 700,
    height: "22px",
    justifyContent: "center",
    opacity: isSelected ? 1 : 0,
    width: "22px",
  };
}

const phoneInputStyle: CSSProperties = {
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  fontSize: "18px",
  minHeight: "56px",
  padding: "0 16px",
  width: "100%",
};

const quickOptionsWrapperStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "12px",
  marginTop: "12px",
};

const stepperSummaryStyle: CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "12px 16px",
};

const stepperRowStyle: CSSProperties = {
  alignItems: "center",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  display: "flex",
  justifyContent: "space-between",
  minHeight: "72px",
  padding: "12px 16px",
};

const stepperControlStyle: CSSProperties = {
  alignItems: "center",
  display: "grid",
  gap: "8px",
  gridTemplateColumns: "44px 56px 44px",
};

/**
 * Returns the increment/decrement button style for enabled and disabled states.
 */
function stepperButtonStyle(isDisabled: boolean): CSSProperties {
  return {
    background: isDisabled ? "#f8fafc" : "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    color: isDisabled ? "#94a3b8" : "#0f172a",
    cursor: isDisabled ? "not-allowed" : "pointer",
    fontSize: "24px",
    height: "44px",
    lineHeight: 1,
    width: "44px",
  };
}

const stepperValueStyle: CSSProperties = {
  alignItems: "center",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  display: "flex",
  fontSize: "18px",
  fontWeight: 600,
  height: "44px",
  justifyContent: "center",
  width: "56px",
};

/**
 * Returns the quick-suggestion chip style for the selected and idle states.
 */
function quickOptionStyle(isSelected: boolean): CSSProperties {
  return {
    background: isSelected ? "#197e5c" : "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "999px",
    color: isSelected ? "#ffffff" : "#0f172a",
    cursor: "pointer",
    padding: "10px 14px",
  };
}

const tableWrapperStyle: CSSProperties = {
  border: "1px solid #d7dde5",
  borderRadius: "8px",
  overflow: "hidden",
};

const cellStyle: CSSProperties = {
  borderBottom: "1px solid #e2e8f0",
  padding: "12px 14px",
  textAlign: "left",
};
