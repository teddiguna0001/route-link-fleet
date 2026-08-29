import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CircuitBoard, Play, Sparkles } from "lucide-react";
import { Meter, PageHead, Panel, Pill } from "@/components/transit/primitives";
import { inr } from "@/lib/transit-ui";
import {
  BASELINE_OPTIMIZATION_METRICS,
  OPTIMIZED_RESULTS_METRICS,
} from "@/data/transitData";

export const Route = createFileRoute("/optimizer")({
  head: () => ({
    meta: [
      { title: "Network Optimiser — DTC TransitOps" },
      {
        name: "description",
        content:
          "CP-SAT constraint solver comparing baseline and optimised DTC schedules on fleet, deadhead, crew idle time and cost.",
      },
      { property: "og:title", content: "Network Optimiser — DTC TransitOps" },
      {
        property: "og:description",
        content: "CP-SAT solver results: fleet, deadhead, crew idle time and daily operating cost.",
      },
    ],
  }),
  component: Optimizer,
});

type Row = {
  key: string;
  label: string;
  unit?: string;
  base: number;
  opt: number;
  lowerIsBetter: boolean;
  format?: (n: number) => string;
};

const B = BASELINE_OPTIMIZATION_METRICS;
const O = OPTIMIZED_RESULTS_METRICS;

const ROWS: Row[] = [
  { key: "fleet", label: "Fleet utilisation", unit: "%", base: B.fleetUtilization, opt: O.fleetUtilization, lowerIsBetter: false },
  { key: "buses", label: "Buses required", base: B.totalBusesRequired, opt: O.totalBusesRequired, lowerIsBetter: true },
  { key: "dead", label: "Deadhead", unit: "km", base: B.deadheadKm, opt: O.deadheadKm, lowerIsBetter: true },
  { key: "idle", label: "Idle crew hours", unit: "h", base: B.idleCrewHours, opt: O.idleCrewHours, lowerIsBetter: true },
  { key: "unassigned", label: "Unassigned trips", base: B.unassignedTrips, opt: O.unassignedTrips, lowerIsBetter: true },
  { key: "conflicts", label: "Schedule conflicts", base: B.scheduleConflicts, opt: O.scheduleConflicts, lowerIsBetter: true },
  { key: "punct", label: "Punctuality index", unit: "%", base: B.punctualityIndex, opt: O.punctualityIndex, lowerIsBetter: false },
  {
    key: "cost",
    label: "Operating cost / day",
    base: B.operatingCostPerDay,
    opt: O.operatingCostPerDay,
    lowerIsBetter: true,
    format: (n) => `₹${inr(n)}`,
  },
];

function Optimizer() {
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");

  const run = () => {
    setPhase("running");
    setTimeout(() => setPhase("done"), 1600);
  };

  const savings = B.operatingCostPerDay - O.operatingCostPerDay;

  return (
    <div className="space-y-8">
      <PageHead
        eyebrow="Phase 6 — CP-SAT solver"
        title="Network optimiser"
        description="Minimise fleet size, deadhead kilometres and crew idle time while keeping every trip covered and every CMVR constraint satisfied."
        aside={
          <button
            onClick={run}
            disabled={phase === "running"}
            className="inline-flex h-16 items-center gap-2 rounded-md bg-primary px-8 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:scale-105 disabled:opacity-70"
          >
            {phase === "running" ? (
              <>
                <CircuitBoard className="h-5 w-5 animate-spin" strokeWidth={2.5} />
                Solving…
              </>
            ) : (
              <>
                <Play className="h-5 w-5" strokeWidth={2.5} />
                {phase === "done" ? "Re-run solver" : "Run optimiser"}
              </>
            )}
          </button>
        }
      />

      <section className="grid gap-px overflow-hidden rounded-lg bg-border sm:grid-cols-2 xl:grid-cols-4">
        {[
          { k: "Solver runtime", v: `${O.solverRuntimeSecs}s`, tone: "text-primary" },
          { k: "Iterations", v: O.iterationsCount.toLocaleString("en-IN"), tone: "text-violet" },
          { k: "Optimality gap", v: `${O.optimalityGapPct}%`, tone: "text-secondary" },
          { k: "Daily saving", v: `₹${inr(savings)}`, tone: "text-accent" },
        ].map((s) => (
          <div key={s.k} className="bg-card p-6">
            <p className="label-xs text-muted-foreground">{s.k}</p>
            <p className={`num mt-3 text-3xl font-extrabold ${s.tone}`}>
              {phase === "done" ? s.v : "—"}
            </p>
          </div>
        ))}
      </section>

      <Panel
        title="Baseline versus optimised"
        hint={
          phase === "done"
            ? "Solver returned a feasible improved plan. Publish to push it to depot terminals."
            : "Run the solver to compare against today's manual plan."
        }
        action={
          phase === "done" ? (
            <Pill tone="secondary" solid>
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
              Optimal plan ready
            </Pill>
          ) : null
        }
      >
        <ul className="space-y-6">
          {ROWS.map((r) => {
            const showOpt = phase === "done";
            const value = showOpt ? r.opt : r.base;
            const improved = r.lowerIsBetter ? r.opt < r.base : r.opt > r.base;
            const delta = r.base === 0 ? 0 : Math.round(((r.opt - r.base) / r.base) * 100);
            const fmt = r.format ?? ((n: number) => `${n}${r.unit ?? ""}`);
            const max = Math.max(r.base, r.opt, 1);
            return (
              <li key={r.key} className="grid gap-3 sm:grid-cols-[220px_1fr_120px] sm:items-center">
                <p className="text-sm font-semibold">{r.label}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="label-xs w-16 text-muted-foreground">Base</span>
                    <Meter value={(r.base / max) * 100} tone="neutral" />
                    <span className="num w-28 text-right text-sm text-muted-foreground">
                      {fmt(r.base)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="label-xs w-16 text-primary">Solver</span>
                    <Meter
                      value={showOpt ? (r.opt / max) * 100 : 0}
                      tone={improved ? "secondary" : "accent"}
                    />
                    <span className="num w-28 text-right text-sm font-bold">
                      {showOpt ? fmt(r.opt) : "—"}
                    </span>
                  </div>
                </div>
                <div className="sm:text-right">
                  {showOpt ? (
                    <Pill tone={improved ? "secondary" : "accent"}>
                      {delta > 0 ? "+" : ""}
                      {delta}%
                    </Pill>
                  ) : (
                    <span className="num text-sm text-muted-foreground">pending</span>
                  )}
                </div>
                <span className="sr-only">{value}</span>
              </li>
            );
          })}
        </ul>
      </Panel>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            t: "Objective",
            b: "bg-primary",
            f: "text-primary-foreground",
            d: "Weighted minimisation of fleet count, deadhead km and crew idle hours, with hard coverage on every published trip.",
          },
          {
            t: "Hard constraints",
            b: "bg-secondary",
            f: "text-secondary-foreground",
            d: "45-minute rest per 4.5 driving hours, ≤12-hour spreadover, depot capacity, vehicle range and maintenance windows.",
          },
          {
            t: "Search strategy",
            b: "bg-ink",
            f: "text-ink-foreground",
            d: "CP-SAT with 8 parallel workers, warm-started from yesterday's published roster, stopped at a 2% optimality gap.",
          },
        ].map((c) => (
          <article key={c.t} className={`rounded-lg ${c.b} p-8 transition-transform duration-200 hover:scale-[1.02]`}>
            <h3 className={`text-xl font-extrabold ${c.f}`}>{c.t}</h3>
            <p className={`mt-3 text-sm leading-relaxed ${c.f} opacity-80`}>{c.d}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
