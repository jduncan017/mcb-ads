"use client";

const message = "Enterprise offer — First month $100 (save 90%)";

export function OfferTicker() {
  const items = Array.from({ length: 12 }, (_, i) => (
    <span key={i} className="flex shrink-0 items-center gap-3">
      <span className="text-lg font-semibold tracking-wide text-white">
        {message}
      </span>
      <span className="text-primary-200 text-5xl">·</span>
    </span>
  ));

  return (
    <div className="bg-primary-400/20 border-primary-300/40 my-4 overflow-hidden border-y py-6">
      <div className="animate-ticker flex w-max gap-3">
        {items}
        {items}
      </div>
    </div>
  );
}
