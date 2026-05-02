"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, X, Loader2 } from "lucide-react";
import { usePersistedQueryString } from "~/components/QueryParamProvider";
import { analytics } from "~/lib/analytics";
import { env } from "~/env";

// ============================================================================
// Types
// ============================================================================

type EventType = "Wedding" | "Corporate Event" | "Private Party" | "Other";
type GuestCount = "Under 30" | "30-75" | "75-150" | "150+";
type WhenAnswer =
  | "This month"
  | "Next 60 days"
  | "This summer"
  | "Fall or later"
  | "Not sure yet";
type Budget =
  | "Under $1,000"
  | "$1,000-$1,500"
  | "$1,500-$3,000"
  | "$3,000-$7,000"
  | "$7,000+"
  | "Not sure yet";

type Step =
  | "event"
  | "guests"
  | "when"
  | "budget"
  | "friction"
  | "decline"
  | "contact"
  | "submitting";

interface Answers {
  eventType?: EventType;
  guestCount?: GuestCount;
  when?: WhenAnswer;
  budget?: Budget;
  name?: string;
  email?: string;
}

interface DiscoveryModalProps {
  open: boolean;
  onClose: () => void;
  buttonId?: string;
}

// ============================================================================
// Configuration
// ============================================================================

const eventOptions: EventType[] = [
  "Wedding",
  "Corporate Event",
  "Private Party",
  "Other",
];
const guestOptions: GuestCount[] = ["Under 30", "30-75", "75-150", "150+"];
const whenOptions: WhenAnswer[] = [
  "This month",
  "Next 60 days",
  "This summer",
  "Fall or later",
  "Not sure yet",
];
const budgetOptions: Budget[] = [
  "Under $1,000",
  "$1,000-$1,500",
  "$1,500-$3,000",
  "$3,000-$7,000",
  "$7,000+",
  "Not sure yet",
];

const FRICTION_BUDGETS: Budget[] = ["$1,000-$1,500", "Not sure yet"];
const DECLINE_BUDGETS: Budget[] = ["Under $1,000"];

// Steps that count toward progress (5 visible questions)
const PROGRESS_STEPS: Step[] = ["event", "guests", "when", "budget", "contact"];

// ============================================================================
// Component
// ============================================================================

export function DiscoveryModal({
  open,
  onClose,
  buttonId,
}: DiscoveryModalProps) {
  const persistedQs = usePersistedQueryString();
  const [step, setStep] = useState<Step>("event");
  const [answers, setAnswers] = useState<Answers>({});
  const [history, setHistory] = useState<Step[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Reset when re-opened
  useEffect(() => {
    if (open) {
      setStep("event");
      setAnswers({});
      setHistory([]);
      setError(null);
      setSubmitted(false);
      analytics.calModalOpened(buttonId ?? "modal");
    }
  }, [open, buttonId]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // ── Step navigation ─────────────────────────────────────────────────────
  const advanceTo = useCallback(
    (nextStep: Step) => {
      setHistory((h) => [...h, step]);
      setStep(nextStep);
      setError(null);
    },
    [step],
  );

  const goBack = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const newHistory = [...h];
      const last = newHistory.pop()!;
      setStep(last);
      setError(null);
      return newHistory;
    });
  }, []);

  // ── Choice handler with auto-advance ────────────────────────────────────
  const selectChoice = useCallback(
    <K extends keyof Answers>(key: K, value: Answers[K], next: Step) => {
      setAnswers((a) => ({ ...a, [key]: value }));
      // Small delay so user sees their selection register
      setTimeout(() => {
        setHistory((h) => [...h, step]);
        setStep(next);
        setError(null);
      }, 200);
    },
    [step],
  );

  // ── Budget routing ──────────────────────────────────────────────────────
  const trackingSource = buttonId ?? "modal";
  const handleBudgetChoice = useCallback(
    (value: Budget) => {
      setAnswers((a) => ({ ...a, budget: value }));
      setTimeout(() => {
        setHistory((h) => [...h, "budget"]);
        if (DECLINE_BUDGETS.includes(value)) {
          analytics.modalDeclineShown(trackingSource, "auto");
          setStep("decline");
        } else if (FRICTION_BUDGETS.includes(value)) {
          analytics.modalFrictionShown(trackingSource);
          setStep("friction");
        } else {
          setStep("contact");
        }
        setError(null);
      }, 200);
    },
    [trackingSource],
  );

  // ── Friction screen choice ──────────────────────────────────────────────
  const handleFrictionYes = useCallback(() => advanceTo("contact"), [advanceTo]);
  const handleFrictionNo = useCallback(() => {
    analytics.modalDeclineShown(trackingSource, "friction_no");
    advanceTo("decline");
  }, [advanceTo, trackingSource]);

  // ── Submit handlers ─────────────────────────────────────────────────────
  const submitContact = useCallback(
    async (name: string, email: string) => {
      setStep("submitting");
      try {
        const utm = parseUtm(persistedQs);
        await fetch("/api/discovery-lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventType: answers.eventType,
            guestCount: answers.guestCount,
            when: answers.when,
            budget: answers.budget,
            name,
            email,
            declined: false,
            utm,
            pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
          }),
        });

        // PostHog: lead_submitted (qualified path)
        analytics.leadSubmitted({
          source: trackingSource,
          qualified: true,
          eventType: answers.eventType,
          guestCount: answers.guestCount,
          when: answers.when,
          budget: answers.budget,
        });

        // Fire client-side Meta Lead event (browser pixel)
        if (typeof window !== "undefined") {
          const w = window as unknown as {
            fbq?: (cmd: string, event: string, params?: Record<string, unknown>) => void;
          };
          w.fbq?.("track", "Lead", {
            content_category: answers.eventType,
            value: 0,
            currency: "USD",
          });
        }

        // Build Calendly URL with prefill
        const bookingUrl = buildCalendlyUrl({
          base: env.NEXT_PUBLIC_BOOKING_URL,
          name,
          email,
          answers,
          persistedQs,
        });

        if (bookingUrl) {
          window.location.href = bookingUrl;
        } else {
          setError("Booking URL not configured. Please contact us directly.");
          setStep("contact");
        }
      } catch (e) {
        console.error(e);
        setError("Something went wrong. Please try again.");
        setStep("contact");
      }
    },
    [answers, persistedQs, trackingSource],
  );

  const submitDecline = useCallback(
    async (email: string, notes: string) => {
      setStep("submitting");
      try {
        const utm = parseUtm(persistedQs);
        await fetch("/api/discovery-lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventType: answers.eventType ?? "n/a",
            guestCount: answers.guestCount ?? "n/a",
            when: answers.when ?? "n/a",
            budget: answers.budget ?? "Under $1,000",
            email,
            notes,
            declined: true,
            utm,
            pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
          }),
        });

        // PostHog: lead_submitted (decline path)
        analytics.leadSubmitted({
          source: trackingSource,
          qualified: false,
          eventType: answers.eventType,
          guestCount: answers.guestCount,
          when: answers.when,
          budget: answers.budget,
        });

        setSubmitted(true);
      } catch (e) {
        console.error(e);
        setError("Something went wrong. Please try again.");
        setStep("decline");
      }
    },
    [answers, persistedQs, trackingSource],
  );

  // ── Progress index for indicator ────────────────────────────────────────
  const progressIndex = useMemo(() => {
    const idx = PROGRESS_STEPS.indexOf(step);
    return idx >= 0 ? idx : PROGRESS_STEPS.indexOf("contact");
  }, [step]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-stretch justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="discovery-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        style={{ background: "var(--section-gradient)" }}
        className="relative mx-auto flex h-full w-full max-w-none flex-col overflow-hidden border-gray-400/30 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.6)] sm:h-auto sm:max-h-[92vh] sm:min-h-[480px] sm:max-w-[560px] sm:rounded-2xl sm:border"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <button
            type="button"
            onClick={goBack}
            disabled={history.length === 0 || step === "submitting"}
            aria-label="Go back"
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-200 transition hover:bg-white/10 disabled:opacity-30"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <ProgressDots
            total={PROGRESS_STEPS.length}
            current={progressIndex}
            faded={step === "friction" || step === "decline" || step === "submitting"}
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-200 transition hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col px-6 py-8 sm:px-8 sm:py-10">
          {step === "event" && (
            <ChoiceStep
              title="What Kind of Event Are You Planning?"
              options={eventOptions}
              selected={answers.eventType}
              onSelect={(v) => selectChoice("eventType", v, "guests")}
            />
          )}
          {step === "guests" && (
            <ChoiceStep
              title="How Many Guests?"
              options={guestOptions}
              selected={answers.guestCount}
              onSelect={(v) => selectChoice("guestCount", v, "when")}
            />
          )}
          {step === "when" && (
            <ChoiceStep
              title="When Is the Event?"
              options={whenOptions}
              selected={answers.when}
              onSelect={(v) => selectChoice("when", v, "budget")}
            />
          )}
          {step === "budget" && (
            <ChoiceStep
              title="Realistic Total Bar Budget?"
              subtitle="We handle the bartending. You handle the alcohol."
              options={budgetOptions}
              selected={answers.budget}
              onSelect={handleBudgetChoice}
            />
          )}
          {step === "friction" && (
            <FrictionStep
              onYes={handleFrictionYes}
              onNo={handleFrictionNo}
            />
          )}
          {step === "decline" && !submitted && (
            <DeclineStep error={error} onSubmit={submitDecline} onClose={onClose} />
          )}
          {step === "decline" && submitted && (
            <DeclineSubmittedStep onClose={onClose} />
          )}
          {step === "contact" && (
            <ContactStep
              error={error}
              onSubmit={submitContact}
              defaultName={answers.name}
              defaultEmail={answers.email}
            />
          )}
          {step === "submitting" && <SubmittingStep />}
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ============================================================================
// Sub-steps
// ============================================================================

function ChoiceStep<T extends string>({
  title,
  subtitle,
  options,
  selected,
  onSelect,
}: {
  title: string;
  subtitle?: string;
  options: readonly T[];
  selected?: T;
  onSelect: (value: T) => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <h3 id="discovery-title" className="mb-2 text-2xl tracking-wide">
        {title}
      </h3>
      {subtitle && (
        <p className="mb-6 text-sm font-normal tracking-wide text-white/80">
          {subtitle}
        </p>
      )}
      {!subtitle && <div className="mb-6" />}
      <div className="flex flex-col gap-2.5">
        {options.map((opt) => {
          const isSelected = selected === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect(opt)}
              className={`group focus-visible:ring-primary-300/50 flex items-center justify-between rounded-xl border bg-linear-to-br px-5 py-4 text-left text-base font-medium tracking-wide text-white transition focus:outline-none focus-visible:ring-2 ${
                isSelected
                  ? "border-primary-200/60 from-primary-300/30 to-primary-400/30 shadow-[0_0_24px_-8px_rgba(101,144,195,0.5)]"
                  : "border-gray-400/40 from-gray-200/20 to-gray-600/20 hover:border-primary-200/50 hover:from-primary-300/15 hover:to-primary-400/15"
              }`}
            >
              <span>{opt}</span>
              <ArrowRight
                className={`h-4 w-4 transition ${
                  isSelected
                    ? "text-primary-100 translate-x-0 opacity-100"
                    : "text-primary-200/70 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FrictionStep({
  onYes,
  onNo,
}: {
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <h3 className="mb-3 text-2xl tracking-wide">A Heads Up on Pricing</h3>
      <p className="mb-7 text-base leading-relaxed font-normal tracking-wide text-white">
        Our minimum is{" "}
        <span className="text-primary-100 font-semibold tracking-wider">
          $800 for bartending
        </span>{" "}
        alone, and you&apos;ll need budget for alcohol on top. Tight, but doable
        for small events. Still want to chat?
      </p>
      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={onYes}
          className="border-primary-200/60 from-primary-300/30 to-primary-400/30 focus-visible:ring-primary-300/50 rounded-xl border bg-linear-to-br px-5 py-4 text-base font-medium tracking-wide text-white shadow-[0_0_24px_-8px_rgba(101,144,195,0.5)] transition hover:from-primary-300/40 hover:to-primary-400/40 focus:outline-none focus-visible:ring-2"
        >
          Yes, that works
        </button>
        <button
          type="button"
          onClick={onNo}
          className="from-gray-200/20 to-gray-600/20 hover:border-primary-200/50 rounded-xl border border-gray-400/40 bg-linear-to-br px-5 py-4 text-base font-medium tracking-wide text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          Above my budget
        </button>
      </div>
    </div>
  );
}

function ContactStep({
  error,
  defaultName,
  defaultEmail,
  onSubmit,
}: {
  error: string | null;
  defaultName?: string;
  defaultEmail?: string;
  onSubmit: (name: string, email: string) => void;
}) {
  const [name, setName] = useState(defaultName ?? "");
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [emailError, setEmailError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  function handleSubmit() {
    if (!name.trim()) {
      nameRef.current?.focus();
      return;
    }
    if (!email.trim() || !isValidEmail(email)) {
      setEmailError("Please enter a valid email");
      emailRef.current?.focus();
      return;
    }
    setEmailError(null);
    onSubmit(name.trim(), email.trim());
  }

  function handleNameKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!name.trim()) return;
      emailRef.current?.focus();
    }
  }

  function handleEmailKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <h3 className="mb-2 text-2xl tracking-wide">
        Last Thing, Who Are We Sending the Quote To?
      </h3>
      <p className="mb-6 text-sm font-normal tracking-wide text-white/80">
        We&apos;ll email you a confirmation and follow up after the call.
      </p>
      <div className="flex flex-col gap-4">
        <ModalInput
          label="First name"
          ref={nameRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleNameKey}
          placeholder="Jane"
          autoComplete="given-name"
        />
        <ModalInput
          label="Email"
          ref={emailRef}
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(null);
          }}
          onKeyDown={handleEmailKey}
          placeholder="you@example.com"
          autoComplete="email"
          error={emailError}
        />
      </div>
      {error && (
        <p className="mt-4 text-sm text-rose-400">{error}</p>
      )}
      <div className="mt-auto flex items-center justify-between pt-8">
        <span className="text-xs tracking-wide text-white/60">
          Press Enter ↵ to continue
        </span>
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-primary-300 hover:bg-primary-200 focus-visible:ring-primary-300/50 rounded-full px-5 py-2.5 text-sm font-semibold tracking-wide text-white shadow-[0_0_24px_-4px_rgba(101,144,195,0.6)] transition focus:outline-none focus-visible:ring-2"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

function DeclineStep({
  error,
  onSubmit,
  onClose,
}: {
  error: string | null;
  onSubmit: (email: string, notes: string) => void;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  function handleSubmit() {
    if (!email.trim() || !isValidEmail(email)) {
      setEmailError("Please enter a valid email");
      emailRef.current?.focus();
      return;
    }
    setEmailError(null);
    onSubmit(email.trim(), notes.trim());
  }

  return (
    <div className="flex flex-1 flex-col">
      <h3 className="mb-3 text-2xl tracking-wide">We May Not Be the Right Fit</h3>
      <p className="mb-6 text-base leading-relaxed font-normal tracking-wide text-white">
        We&apos;re typically a fit for events with bar budgets of{" "}
        <span className="font-semibold tracking-wider">$1,000+</span>. Want to
        send us a quick note about your event anyway? Sometimes we can make
        something work.
      </p>
      <div className="flex flex-col gap-4">
        <ModalInput
          label="Your email"
          ref={emailRef}
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(null);
          }}
          placeholder="you@example.com"
          autoComplete="email"
          error={emailError}
        />
        <ModalTextarea
          label="Tell us about your event (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Date, guest count, anything else we should know..."
          rows={3}
        />
      </div>
      {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
      <div className="mt-auto flex flex-col gap-3 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onClose}
          className="text-sm tracking-wide text-white/60 transition hover:text-white"
        >
          No thanks, close
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-primary-300 hover:bg-primary-200 focus-visible:ring-primary-300/50 rounded-full px-5 py-2.5 text-sm font-semibold tracking-wide text-white shadow-[0_0_24px_-4px_rgba(101,144,195,0.6)] transition focus:outline-none focus-visible:ring-2"
        >
          Send note →
        </button>
      </div>
    </div>
  );
}

function DeclineSubmittedStep({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <h3 className="mb-3 text-2xl tracking-wide">Got It, Thanks for Reaching Out</h3>
      <p className="mb-8 max-w-sm text-base font-normal tracking-wide text-white">
        We&apos;ll review your note and get back to you if we can find a way to
        make it work.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="rounded-full border border-white/15 bg-white/[0.06] px-5 py-2 text-sm font-medium tracking-wide text-white transition hover:bg-white/10"
      >
        Close
      </button>
    </div>
  );
}

function SubmittingStep() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary-300" />
      <p className="text-sm tracking-wide text-white/75">
        Sending you to the booking page...
      </p>
    </div>
  );
}

// ============================================================================
// Form primitives
// ============================================================================

interface ModalInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "className"
> {
  label: string;
  error?: string | null;
}

const ModalInput = forwardRef<HTMLInputElement, ModalInputProps>(
  function ModalInput({ label, error, ...rest }, ref) {
    return (
      <label className="flex flex-col gap-2">
        <span className="text-xs font-semibold tracking-[0.12em] text-white/70 uppercase">
          {label}
        </span>
        <input
          ref={ref}
          {...rest}
          className={`focus-visible:ring-primary-300/50 from-gray-200/10 to-gray-600/10 w-full rounded-xl border bg-linear-to-br px-4 py-3.5 text-base font-normal tracking-wide text-white placeholder:font-light placeholder:tracking-wide placeholder:text-white/40 focus:outline-none focus-visible:ring-2 ${
            error ? "border-rose-400/60" : "border-gray-400/40 focus:border-primary-200/60"
          }`}
        />
        {error && <span className="text-xs text-rose-400">{error}</span>}
      </label>
    );
  },
);

interface ModalTextareaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "className"
> {
  label: string;
  error?: string | null;
}

function ModalTextarea({ label, error, ...rest }: ModalTextareaProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-semibold tracking-[0.12em] text-white/70 uppercase">
        {label}
      </span>
      <textarea
        {...rest}
        className={`w-full resize-none rounded-xl border bg-black/30 px-4 py-3 text-base text-white placeholder:text-neutral-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300/50 ${
          error ? "border-rose-400/60" : "border-white/15 focus:border-primary-300/50"
        }`}
      />
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </label>
  );
}

function ProgressDots({
  total,
  current,
  faded,
}: {
  total: number;
  current: number;
  faded: boolean;
}) {
  return (
    <div className={`flex items-center gap-1.5 transition-opacity ${faded ? "opacity-30" : ""}`}>
      {Array.from({ length: total }).map((_, i) => {
        const filled = i <= current;
        const active = i === current;
        return (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              active
                ? "w-6 bg-primary-300"
                : filled
                  ? "w-1.5 bg-primary-300/70"
                  : "w-1.5 bg-white/15"
            }`}
          />
        );
      })}
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseUtm(qs: string) {
  if (!qs) return {};
  const params = new URLSearchParams(qs);
  return {
    source: params.get("utm_source") ?? undefined,
    medium: params.get("utm_medium") ?? undefined,
    campaign: params.get("utm_campaign") ?? undefined,
    fbclid: params.get("fbclid") ?? undefined,
  };
}

function buildCalendlyUrl({
  base,
  name,
  email,
  answers,
  persistedQs,
}: {
  base: string | undefined;
  name: string;
  email: string;
  answers: Answers;
  persistedQs: string;
}): string | null {
  if (!base) return null;
  const url = new URL(base);
  // Calendly standard prefill
  url.searchParams.set("name", name);
  url.searchParams.set("email", email);
  // Custom questions a1..a4 (configure these in Calendly in this exact order)
  if (answers.eventType) url.searchParams.set("a1", answers.eventType);
  if (answers.guestCount) url.searchParams.set("a2", answers.guestCount);
  if (answers.when) url.searchParams.set("a3", answers.when);
  if (answers.budget) url.searchParams.set("a4", answers.budget);
  // Carry through utm/fbclid for attribution
  if (persistedQs) {
    const carry = new URLSearchParams(persistedQs);
    ["utm_source", "utm_medium", "utm_campaign", "fbclid"].forEach((k) => {
      const v = carry.get(k);
      if (v && !url.searchParams.has(k)) url.searchParams.set(k, v);
    });
  }
  return url.toString();
}

export type { DiscoveryModalProps };
