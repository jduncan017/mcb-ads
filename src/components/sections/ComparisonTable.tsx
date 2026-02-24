import { Check, X } from "lucide-react";
import { FadeIn } from "~/components/FadeIn";

const competitors = [
  "FinalBit",
  "Filmustage",
  "Rivet AI",
  "StudioBinder",
  "Yamdu",
  "Final Draft",
] as const;

const features = [
  {
    name: "AI Automation",
    support: [true, true, true, false, false, false] as const,
  },
  {
    name: "Breakdown",
    support: [true, true, true, "Manual", "Manual", false] as const,
  },
  {
    name: "Budget + Rebates",
    support: [true, "Partial", "Partial", false, false, false] as const,
  },
  {
    name: "Scheduling",
    support: [true, true, true, "Manual", "Manual", false] as const,
  },
  {
    name: "Story Development",
    support: [true, false, false, false, false, true] as const,
  },
  {
    name: "Script Analysis",
    support: [true, false, "Coverage", false, false, false] as const,
  },
  {
    name: "Storyboard",
    support: [true, true, false, "Manual", false, false] as const,
  },
  {
    name: "Video Creation",
    support: [true, false, false, false, false, false] as const,
  },
  {
    name: "Team Seats (base)",
    support: ["12", "10", "N/A", "6", "—", "—"] as const,
  },
  {
    name: "Price/mo",
    support: ["$999", "$499", "~$150", "$169", "$239", "~$10"] as const,
  },
];

function CellValue({ value }: { value: boolean | string }) {
  if (value === true) {
    return <Check className="mx-auto h-5 w-5 text-secondary-300" strokeWidth={2.5} />;
  }
  if (value === false) {
    return <X className="mx-auto h-5 w-5 text-neutral-300" strokeWidth={2.5} />;
  }
  return <span>{value}</span>;
}

export function ComparisonTable() {
  return (
    <section className="section-pad">
      <div className="mx-auto max-w-[1200px]">
        <FadeIn>
          <h2 className="mb-4 text-center">How FinalBit Compares</h2>
          <p className="mb-12 text-center text-neutral-200">
            The only platform that connects story development to pre-production
            in one workspace.
          </p>
        </FadeIn>
        <FadeIn delay={150}>
        <p className="mb-3 text-center text-sm text-neutral-300 md:hidden">
          Swipe to compare all tools &rarr;
        </p>
        <div className="overflow-x-auto rounded-[16px] border border-gray-200/20 bg-neutral-400/60">
          <table className="w-full min-w-[640px] text-base">
            <thead>
              <tr className="border-b border-gray-200/20 bg-white/[0.06]">
                <th className="px-5 py-4 text-left text-lg font-medium text-neutral-200">
                  Feature
                </th>
                {competitors.map((c, i) => (
                  <th
                    key={c}
                    className={`px-5 py-4 text-center text-lg font-semibold ${i === 0 ? "text-primary-300" : "text-neutral-200"}`}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((f, rowIdx) => (
                <tr
                  key={f.name}
                  className={`border-b border-gray-200/10 transition-colors last:border-0 hover:bg-white/[0.06] ${rowIdx % 2 === 1 ? "bg-white/[0.03]" : ""}`}
                >
                  <td className="px-5 py-3.5 font-medium text-neutral-100">
                    {f.name}
                  </td>
                  {f.support.map((val, i) => (
                    <td
                      key={`${f.name}-${i}`}
                      className={`px-5 py-3.5 text-center ${i === 0 ? "bg-primary-300/10 font-medium text-white" : ""}`}
                    >
                      <CellValue value={val} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </FadeIn>
      </div>
    </section>
  );
}
