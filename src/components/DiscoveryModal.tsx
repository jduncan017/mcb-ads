"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, X, Loader2 } from "lucide-react";
import { usePersistedQueryString } from "~/components/QueryParamProvider";
import { analytics } from "~/lib/analytics";
import { stashBookingPrefill } from "~/lib/booking-prefill";

// ============================================================================
// Types
// ============================================================================

type EventType = "Wedding" | "Corporate Event" | "Private Party" | "Other";
type GuestCount = "Under 30" | "30 to 75" | "75 to 150" | "150+";
type Budget =
  | "Under $1,000"
  | "$1,000 to $2,000"
  | "$2,000 to $5,000"
  | "$5,000+"
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
  /** ISO YYYY-MM-DD from the date picker. Formatted for display at send time. */
  when?: string;
  budget?: Budget;
  name?: string;
  email?: string;
  phone?: string;
}

interface DiscoveryModalProps {
  open: boolean;
  buttonId?: string;
}

/** Set by `CalButton` via Provider — avoids non-serializable callback props on this client export. */
export const DiscoveryModalCloseContext = createContext<(() => void) | null>(
  null,
);

// ============================================================================
// Configuration
// ============================================================================

const eventOptions: EventType[] = [
  "Wedding",
  "Corporate Event",
  "Private Party",
  "Other",
];
const guestOptions: GuestCount[] = [
  "Under 30",
  "30 to 75",
  "75 to 150",
  "150+",
];
const budgetOptions: Budget[] = [
  "Under $1,000",
  "$1,000 to $2,000",
  "$2,000 to $5,000",
  "$5,000+",
  "Not sure yet",
];

const FRICTION_BUDGETS: Budget[] = ["Not sure yet"];
const DECLINE_BUDGETS: Budget[] = ["Under $1,000"];

// Steps that count toward progress (5 visible questions)
const PROGRESS_STEPS: Step[] = ["event", "guests", "when", "budget", "contact"];

// ============================================================================
// Component
// ============================================================================

export function DiscoveryModal({ open, buttonId }: DiscoveryModalProps) {
  const closeModalOrNull = useContext(DiscoveryModalCloseContext);
  if (closeModalOrNull === null) {
    throw new Error(
      "DiscoveryModal must be used inside DiscoveryModalCloseContext.Provider",
    );
  }
  const closeModal = closeModalOrNull;

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
      if (e.key === "Escape") closeModal();
    }
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, closeModal]);

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
  const handleFrictionYes = useCallback(
    () => advanceTo("contact"),
    [advanceTo],
  );
  const handleFrictionNo = useCallback(() => {
    analytics.modalDeclineShown(trackingSource, "friction_no");
    advanceTo("decline");
  }, [advanceTo, trackingSource]);

  // ── Submit handlers ─────────────────────────────────────────────────────
  const submitContact = useCallback(
    async (name: string, email: string, phone: string) => {
      setStep("submitting");
      try {
        const utm = parseUtm(persistedQs);
        // Generate the event_id upfront so all three Lead-related fires share
        // it: server CAPI Lead (in /api/discovery-lead), browser pixel Lead
        // (below), and Schedule reuse via stashBookingPrefill. Without a shared
        // id Meta double-counts browser + server fires.
        const leadEventId =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`;

        await fetch("/api/discovery-lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventType: answers.eventType,
            guestCount: answers.guestCount,
            when: formatEventDate(answers.when),
            budget: answers.budget,
            name,
            email,
            phone,
            declined: false,
            utm,
            eventId: leadEventId,
            pageUrl:
              typeof window !== "undefined" ? window.location.href : undefined,
          }),
        });

        // PostHog: lead_submitted (qualified path)
        analytics.leadSubmitted({
          source: trackingSource,
          qualified: true,
          eventType: answers.eventType,
          guestCount: answers.guestCount,
          when: formatEventDate(answers.when),
          budget: answers.budget,
        });

        // Fire client-side Meta Lead event (browser pixel). eventID matches the
        // server CAPI Lead above so Meta dedupes the pair within its 48hr window.
        if (typeof window !== "undefined") {
          const w = window as unknown as {
            fbq?: (
              cmd: string,
              event: string,
              params?: Record<string, unknown>,
              options?: { eventID?: string },
            ) => void;
          };
          w.fbq?.(
            "track",
            "Lead",
            {
              content_category: answers.eventType,
              value: 0,
              currency: "USD",
            },
            { eventID: leadEventId },
          );
        }

        // Stash the prefill data + a fresh event_id in sessionStorage so /book
        // can render the Calendly inline widget pre-populated, and so /thank-you
        // can render personalized confirmation copy. event_id passes through
        // Calendly via salesforce_uuid so the server-side CAPI Schedule fire
        // (in cal-webhook) and the client-side Schedule fire (in /book) share
        // an event_id and Meta dedupes them.
        // Reuse the same event_id for the downstream Schedule fires so the
        // entire Lead → Schedule funnel ties to one identifier per visitor.
        stashBookingPrefill({
          name,
          email,
          phone,
          eventType: answers.eventType,
          guestCount: answers.guestCount,
          when: formatEventDate(answers.when),
          budget: answers.budget,
          source: trackingSource,
          utm,
          eventId: leadEventId,
        });

        // Carry persisted query string through to /book so utm + fbclid stay
        // in scope for the QueryParamProvider on the next page.
        const dest = persistedQs ? `/book?${persistedQs}` : "/book";
        window.location.href = dest;
      } catch (e) {
        console.error(e);
        setError("Something went wrong. Please try again.");
        setStep("contact");
      }
    },
    [answers, persistedQs, trackingSource],
  );

  const submitDecline = useCallback(
    async (name: string, email: string, notes: string) => {
      try {
        const utm = parseUtm(persistedQs);
        await fetch("/api/discovery-lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventType: answers.eventType ?? "n/a",
            guestCount: answers.guestCount ?? "n/a",
            when: formatEventDate(answers.when) ?? "n/a",
            budget: answers.budget ?? "Under $1,000",
            name,
            email,
            notes,
            declined: true,
            utm,
            pageUrl:
              typeof window !== "undefined" ? window.location.href : undefined,
          }),
        });

        // PostHog: lead_submitted (decline path)
        analytics.leadSubmitted({
          source: trackingSource,
          qualified: false,
          eventType: answers.eventType,
          guestCount: answers.guestCount,
          when: formatEventDate(answers.when),
          budget: answers.budget,
        });

        setSubmitted(true);
      } catch (e) {
        console.error(e);
        setError("Something went wrong. Please try again.");
        throw e;
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
      className="fixed inset-0 z-100 flex items-stretch justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="discovery-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={closeModal}
        aria-hidden="true"
      />

      {/* Card */}
      <div className="sm:bg-primary-400 relative mx-auto flex h-full w-full max-w-none flex-col overflow-hidden border-gray-400/30 bg-slate-800 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.6)] sm:h-auto sm:max-h-[92vh] sm:min-h-[480px] sm:max-w-[520px] sm:rounded-2xl sm:border">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-white/10 px-5 py-4 sm:mb-0">
          <button
            type="button"
            onClick={goBack}
            disabled={history.length === 0 || step === "submitting"}
            aria-label="Go back"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-neutral-200 transition hover:bg-white/40 hover:text-black disabled:opacity-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <ProgressDots
            total={PROGRESS_STEPS.length}
            current={progressIndex}
            faded={
              step === "friction" || step === "decline" || step === "submitting"
            }
          />
          <button
            type="button"
            onClick={closeModal}
            aria-label="Close"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-neutral-200 transition hover:bg-white/40 hover:text-black"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col overflow-y-auto px-6 py-8 sm:px-8 sm:py-10">
          {step === "event" && (
            <ChoiceStep
              title="What Kind of Event Are You Planning?"
              options={eventOptions}
              onSelect={(v) => selectChoice("eventType", v, "guests")}
            />
          )}
          {step === "guests" && (
            <ChoiceStep
              title="How Many Guests?"
              options={guestOptions}
              onSelect={(v) => selectChoice("guestCount", v, "when")}
            />
          )}
          {step === "when" && (
            <DateStep
              initialValue={answers.when}
              onSubmit={(iso) => {
                setAnswers((a) => ({ ...a, when: iso }));
                advanceTo("budget");
              }}
            />
          )}
          {step === "budget" && (
            <ChoiceStep
              title="What's Your Total Bar Budget?"
              subtitle="Including staffing costs and alcohol."
              options={budgetOptions}
              onSelect={handleBudgetChoice}
            />
          )}
          {step === "friction" && (
            <FrictionStep onYes={handleFrictionYes} onNo={handleFrictionNo} />
          )}
          {step === "decline" && !submitted && (
            <DeclineStep
              error={error}
              onSubmit={submitDecline}
              onClose={closeModal}
            />
          )}
          {step === "decline" && submitted && (
            <DeclineSubmittedStep onClose={closeModal} />
          )}
          {step === "contact" && (
            <ContactStep
              error={error}
              onSubmit={submitContact}
              defaultName={answers.name}
              defaultEmail={answers.email}
              defaultPhone={answers.phone}
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
  onSelect,
}: {
  title: string;
  subtitle?: string;
  options: readonly T[];
  onSelect: (value: T) => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <h3
        id="discovery-title"
        className="mb-2 w-full text-center text-2xl tracking-wider"
      >
        {title}
      </h3>
      {subtitle && (
        <p className="mb-6 w-full text-center text-sm font-normal tracking-wide text-white/90">
          {subtitle}
        </p>
      )}
      {!subtitle && <div className="mb-6" />}
      <div className="flex flex-col gap-4">
        {options.map((opt) => (
          <ChoiceButton key={opt} onClick={() => onSelect(opt)}>
            {opt}
          </ChoiceButton>
        ))}
      </div>
    </div>
  );
}

function ChoiceButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group hover:border-primary-200/50 border-primary-200/15 from-primary-300 to-primary-400 flex cursor-pointer items-center justify-between rounded-xl border bg-linear-to-br px-5 py-4 font-medium tracking-wide text-white transition hover:from-slate-300 hover:to-slate-400/15 hover:text-black"
    >
      <span>{children}</span>
      <ArrowRight className="text-primary-white h-4 w-4 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
    </button>
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
      <h3 className="mb-2 w-full text-center text-2xl tracking-wider">
        A Heads Up on Pricing
      </h3>
      <p className="mb-6 w-full text-center text-sm font-normal tracking-wide text-white/90">
        Our minimum is{" "}
        <span className="text-primary-100 font-semibold">
          $800 for bartending
        </span>{" "}
        services. Alcohol is a separate charge. That&apos;s tight, but doable
        for small events. Still want to chat?
      </p>
      <div className="flex flex-col gap-4">
        <ChoiceButton onClick={onYes}>Yes, that works</ChoiceButton>
        <ChoiceButton onClick={onNo}>Above my budget</ChoiceButton>
      </div>
    </div>
  );
}

function DateStep({
  initialValue,
  onSubmit,
}: {
  initialValue?: string;
  onSubmit: (iso: string) => void;
}) {
  const [date, setDate] = useState(initialValue ?? "");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  function handleSubmit() {
    if (!date) {
      setError("Please pick a date");
      inputRef.current?.focus();
      return;
    }
    setError(null);
    onSubmit(date);
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <h3 className="mb-2 w-full text-center text-2xl tracking-wider">
        When Is the Event?
      </h3>
      <p className="mb-6 w-full text-center text-sm font-normal tracking-wide text-white/90">
        Not locked in yet? Pick the closest date you have in mind.
      </p>
      <ModalInput
        ref={inputRef}
        label="Event date"
        type="date"
        min={today}
        value={date}
        onChange={(e) => {
          setDate(e.target.value);
          if (error) setError(null);
        }}
        onKeyDown={handleKey}
        error={error}
      />
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

function ContactStep({
  error,
  defaultName,
  defaultEmail,
  defaultPhone,
  onSubmit,
}: {
  error: string | null;
  defaultName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
  onSubmit: (name: string, email: string, phone: string) => void;
}) {
  const [name, setName] = useState(defaultName ?? "");
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [phone, setPhone] = useState(defaultPhone ?? "");
  const [emailError, setEmailError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

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
    // Phone is optional — submit even if empty.
    onSubmit(name.trim(), email.trim(), phone.trim());
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
      if (!email.trim() || !isValidEmail(email)) {
        setEmailError("Please enter a valid email");
        return;
      }
      setEmailError(null);
      phoneRef.current?.focus();
    }
  }

  function handlePhoneKey(e: React.KeyboardEvent<HTMLInputElement>) {
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
        <ModalInput
          label="Phone *"
          ref={phoneRef}
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onKeyDown={handlePhoneKey}
          placeholder="(555) 123-4567"
          autoComplete="tel"
        />
      </div>
      {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
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
  onSubmit: (name: string, email: string, notes: string) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  async function handleSubmit() {
    if (submitting) return;
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
    setSubmitting(true);
    try {
      await onSubmit(name.trim(), email.trim(), notes.trim());
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <h3 className="mb-3 w-full text-center text-2xl tracking-wider">
        We May Not Be the Right Fit
      </h3>
      <p className="mb-6 text-center text-base leading-relaxed font-normal tracking-wide text-white">
        Our minimum is $800 and doesn&apos;t include the cost of alcohol. If
        you&apos;d still like to reach out you can send us an email below:
      </p>
      <div className="flex flex-col gap-6">
        <ModalInput
          label="First name"
          ref={nameRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane"
          autoComplete="given-name"
        />
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
          disabled={submitting}
          className="text-sm tracking-wide text-white/60 transition hover:text-white disabled:opacity-50"
        >
          No thanks
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-primary-300 hover:bg-primary-200 focus-visible:ring-primary-300/50 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold tracking-wide text-white shadow-[0_0_24px_-4px_rgba(101,144,195,0.6)] transition focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send →"
          )}
        </button>
      </div>
    </div>
  );
}

function DeclineSubmittedStep({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <h3 className="mb-3 text-2xl tracking-wide">
        Got It, Thanks for Reaching Out
      </h3>
      <p className="mb-8 max-w-sm text-base font-normal tracking-wide text-white">
        We&apos;ll review your note and get back to you if we can find a way to
        make it work.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="rounded-full border border-white/15 bg-white/6 px-5 py-2 text-sm font-medium tracking-wide text-white transition hover:bg-white/10"
      >
        Close
      </button>
    </div>
  );
}

function SubmittingStep() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <Loader2 className="text-primary-300 h-8 w-8 animate-spin" />
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
          className={`w-full rounded-xl border bg-gray-200 px-4 py-3.5 text-base font-normal tracking-wide text-black placeholder:tracking-wide placeholder:text-black/50 focus:outline-none ${
            error
              ? "border-rose-400/60"
              : "focus:border-primary-200/60 border-gray-400/40"
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
        className={`placeholder:text-black/50focus:outline-none w-full resize-none rounded-xl border bg-gray-200 px-4 py-3 text-base text-black ${
          error
            ? "border-rose-400/60"
            : "focus:border-primary-300/50 border-white/15"
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
    <div
      className={`flex items-center gap-1.5 transition-opacity ${faded ? "opacity-30" : ""}`}
    >
      {Array.from({ length: total }).map((_, i) => {
        const filled = i <= current;
        const active = i === current;
        return (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              active
                ? "w-6 bg-orange-200"
                : filled
                  ? "w-1.5 bg-orange-200/70"
                  : "w-1.5 bg-white/70"
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

/** ISO `YYYY-MM-DD` → `Saturday, July 15, 2026`. Used for email + Calendly prefill. */
function formatEventDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function parseUtm(qs: string) {
  if (!qs) return {};
  const params = new URLSearchParams(qs);
  return {
    source: params.get("utm_source") ?? undefined,
    medium: params.get("utm_medium") ?? undefined,
    campaign: params.get("utm_campaign") ?? undefined,
    content: params.get("utm_content") ?? undefined,
    fbclid: params.get("fbclid") ?? undefined,
    gclid: params.get("gclid") ?? undefined,
    // gbraid/wbraid: iOS Google Ads click IDs when ATT prompt limits gclid
    gbraid: params.get("gbraid") ?? undefined,
    wbraid: params.get("wbraid") ?? undefined,
  };
}

export type { DiscoveryModalProps };
