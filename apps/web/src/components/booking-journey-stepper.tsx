"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AppLocale } from "@/i18n/routing";

type BookingJourneyStepperProps = {
  locale: AppLocale;
};

type BookingStep = {
  id: string;
  href: string | null;
  label: string;
};

const bookingSteps: BookingStep[] = [
  { id: "select-flight", href: "/flight-search", label: "Select Flight" },
  {
    id: "flight-selection",
    href: "/flight-selection",
    label: "Flight Selection",
  },
  { id: "package-selection", href: "/package-selection", label: "Packages" },
  { id: "ancillary-selection", href: "/ancillary-services", label: "Ancillaries" },
  { id: "customer-information", href: "/customer-information", label: "Customer Info" },
  { id: "confirmation", href: "/confirmation", label: "Confirmation" },
];

const routeStepIndexMap: Array<{ pattern: RegExp; stepIndex: number }> = [
  { pattern: /\/flight-search(?:\/|$)/, stepIndex: 0 },
  { pattern: /\/flight-selection(?:\/|$)/, stepIndex: 1 },
  { pattern: /\/package-selection(?:\/|$)/, stepIndex: 2 },
  { pattern: /\/ancillary-services(?:\/|$)/, stepIndex: 3 },
  { pattern: /\/customer-information(?:\/|$)/, stepIndex: 4 },
  { pattern: /\/confirmation(?:\/|$)/, stepIndex: 5 },
];

/**
 * Returns the current booking step index from the active pathname.
 */
function resolveCurrentStepIndex(pathname: string): number | null {
  const matchedStep = routeStepIndexMap.find(({ pattern }) => pattern.test(pathname));
  return matchedStep?.stepIndex ?? null;
}

/**
 * Returns the connector class for completed and upcoming journey rail segments.
 */
function getConnectorClassName(isVisible: boolean, isComplete: boolean): string {
  if (!isVisible) {
    return "h-0.5 w-full bg-transparent";
  }

  return `h-0.5 w-full ${isComplete ? "bg-green-500" : "bg-slate-700"}`;
}

/**
 * Returns the step marker class for completed, current, and upcoming states.
 */
function getMarkerClassName(
  isCompleted: boolean,
  isCurrent: boolean,
  isUpcoming: boolean,
): string {
  const stateClasses = isCompleted
    ? "border-green-500 bg-green-900 text-white"
    : isCurrent
      ? "border-green-500 bg-slate-950 text-green-400"
      : "border-slate-400 bg-white text-slate-900";

  return [
    "inline-flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 text-[12px] font-bold",
    stateClasses,
    isUpcoming ? "opacity-95" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Returns the label class for completed, current, and upcoming steps.
 */
function getLabelClassName(
  isCompleted: boolean,
  isCurrent: boolean,
  isUpcoming: boolean,
): string {
  const stateClasses = isCompleted
    ? "text-white"
    : isCurrent
      ? "text-slate-200 font-semibold"
      : "text-slate-400";

  return [
    "px-2 text-center text-sm leading-[1.4]",
    stateClasses,
    !isCurrent ? "font-medium" : "",
    isUpcoming ? "opacity-95" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Shared booking journey stepper rendered from the booking layout so all
 * booking routes show the same progress indicator.
 */
export function BookingJourneyStepper({
  locale,
}: BookingJourneyStepperProps) {
  const pathname = usePathname();
  const currentStepIndex = resolveCurrentStepIndex(pathname);

  if (currentStepIndex === null) {
    return null;
  }

  const currentStep = bookingSteps[currentStepIndex];

  return (
    <section className="mb-6 grid gap-6 rounded-lg bg-slate-950 p-6 text-white">
      <div>
        <h2 className="mb-2">Booking journey</h2>
        <p className="m-0 text-slate-300">
          Step-by-step reservation progress across the booking flow.
        </p>
      </div>

      <div
        className="grid gap-0"
        style={{
          gridTemplateColumns: `repeat(${bookingSteps.length}, minmax(0, 1fr))`,
        }}
      >
        {bookingSteps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isUpcoming = index > currentStepIndex;
          const stepContent = (
            <>
              <div className="grid grid-cols-[1fr_22px_1fr] items-center">
                <div
                  className={getConnectorClassName(index !== 0, isCompleted || isCurrent)}
                />
                <div className={getMarkerClassName(isCompleted, isCurrent, isUpcoming)}>
                  {isCompleted ? "✓" : ""}
                </div>
                <div
                  className={getConnectorClassName(
                    index !== bookingSteps.length - 1,
                    index < currentStepIndex,
                  )}
                />
              </div>
              <div className={getLabelClassName(isCompleted, isCurrent, isUpcoming)}>
                {step.label}
              </div>
            </>
          );

          if (step.href) {
            return (
              <Link
                className="grid gap-2.5 text-inherit no-underline"
                href={`/${locale}${step.href}`}
                key={step.id}
              >
                {stepContent}
              </Link>
            );
          }

          return (
            <div className="grid gap-2.5" key={step.id}>
              {stepContent}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <strong>Current step:</strong> {currentStep.label}
        </div>
      </div>
    </section>
  );
}
