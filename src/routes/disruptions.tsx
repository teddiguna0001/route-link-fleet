import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, CircleAlert, Radio, Siren, TimerReset } from "lucide-react";
import { Metric, PageHead, Panel, Pill } from "@/components/transit/primitives";
import { severityTone } from "@/lib/transit-ui";
import { INITIAL_DISRUPTION } from "@/data/transitData";

export const Route = createFileRoute("/disruptions")({
  head: () => ({
    meta: [
      { title: "Disruption Desk — DTC TransitOps" },
      {
        name: "description",
        content:
          "Breakdown, absenteeism and congestion events with automated standby recovery plans for the DTC network.",
      },
      { property: "og:title", content: "Disruption Desk — DTC TransitOps" },
      {
        property: "og:description",
        content: "Live disruption events and automated standby recovery plans.",
      },
    ],
  }),
  component: Disruptions,
});

/** Secondary feed entries kept alongside the live event for desk context. */
const FEED = [
  {
    id: "DSR-2211",
    type: "Traffic Congestion",
    severity: "High",
    location: "Ring Road · Ashram Chowk",
    routeNumber: "764",
    status: "Re-Optimized",
    impact: "Corridor speed down to 11 km/h; 6 trips re-timed with +8 min padding.",
  },
  {
    id: "DSR-2209",
    type: "Crew Absenteeism",
    severity: "Moderate",
    location: "Hari Nagar Depot",
    routeNumber: "817",
    status: "Resolved",
    impact: "Relief driver from standby pool covered the 05:40 unlinked duty.",
  },
  {
    id: "DSR-2204",
    type: "Demand Surge",
    severity: "Low",
    location: "Anand Vihar ISBT",
    routeNumber: "543",
    status: "Resolved",
    impact: "Two extra short-turn trips injected between 18:10 and 19:00.",
  },
] as const;

function Disruptions() {
  const [dispatched, setDispatched] = useState(false);
  const event = INITIAL_DISRUPTION;
  const plan = event.recoveryPlan;

  return (
    <div className="space-y-8">
      <PageHead
        eyebrow="Phase 7 — Recovery control"
        title="Disruption desk"
        description="Every incident is scored, matched against the standby pool and answered with a concrete recovery plan before the delay cascades."
        aside={
          <div className="flex items-center gap-2 rounded-md bg-destructive-tint px-5 py-4">
            <Radio className="h-5 w-5 text-destructive" strokeWidth={2.4} />
            <span className="label-xs text-destructive">1 active incident</span>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Affected trips"
          value={event.affectedTripsCount}
          tone="destructive"
          icon={<Siren className="h-5 w-5" strokeWidth={2.4} />}
        />
        <Metric
          label="Passengers impacted"
          value={event.affectedPassengersEst.toLocaleString("en-IN")}
          tone="accent"
        />
        <Metric
          label="Recovery ETA"
          value={plan?.etaMinutes ?? "—"}
          unit="min"
          tone="primary"
          icon={<TimerReset className="h-5 w-5" strokeWidth={2.4} />}
        />
        <Metric
          label="Delay mitigated"
          value={plan?.delayMitigationMins ?? "—"}
          unit="min"
          tone="secondary"
          delta="Versus doing nothing"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-lg bg-ink p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Pill tone={severityTone(event.severity)} solid>
                {event.severity} · {event.type}
              </Pill>
              <h2 className="mt-4 text-3xl font-extrabold text-ink-foreground">{event.location}</h2>
              <p className="num mt-2 text-sm text-ink-foreground/60">
                {event.id} · Route {event.routeNumber} · {event.busId} · {event.timestamp}
              </p>
            </div>
            <span className="label-xs rounded-sm bg-ink-foreground/10 px-3 py-2 text-ink-foreground">
              {event.status}
            </span>
          </div>
          <p className="mt-6 max-w-2xl text-base text-ink-foreground/75">{event.impactSummary}</p>

          {plan ? (
            <div className="mt-8 grid gap-px overflow-hidden rounded-md bg-ink-foreground/15 sm:grid-cols-3">
              {[
                { k: "Replacement bus", v: plan.replacementBusId },
                { k: "Relief driver", v: plan.replacementDriverId },
                { k: "Sourced from", v: plan.depotSourced },
              ].map((i) => (
                <div key={i.k} className="bg-ink p-5">
                  <p className="label-xs text-ink-foreground/50">{i.k}</p>
                  <p className="num mt-2 text-lg font-bold text-ink-foreground">{i.v}</p>
                </div>
              ))}
            </div>
          ) : null}

          <button
            onClick={() => setDispatched(true)}
            className={`mt-8 inline-flex h-16 items-center gap-2 rounded-md px-8 text-sm font-semibold transition-all duration-200 hover:scale-105 ${
              dispatched
                ? "bg-secondary text-secondary-foreground"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {dispatched ? (
              <>
                <CheckCircle2 className="h-5 w-5" strokeWidth={2.5} />
                Recovery dispatched to depot
              </>
            ) : (
              <>
                <Siren className="h-5 w-5" strokeWidth={2.5} />
                Dispatch recovery plan
              </>
            )}
          </button>
        </section>

        <Panel title="Automated action sequence" hint="Generated by the recovery engine, ordered by execution.">
          <ol className="space-y-3">
            {(plan?.actions ?? []).map((action, i) => (
              <li
                key={action}
                className="group flex gap-4 rounded-md bg-muted p-4 transition-all duration-200 hover:scale-[1.02] hover:bg-primary-tint"
              >
                <span className="num flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed">{action}</p>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <Panel title="Incident feed" hint="Last 12 hours across the network.">
        <ul className="grid gap-4 md:grid-cols-3">
          {FEED.map((f) => (
            <li
              key={f.id}
              className="group rounded-lg bg-muted p-6 transition-all duration-200 hover:scale-[1.02] hover:bg-background"
            >
              <div className="flex items-center justify-between">
                <Pill tone={severityTone(f.severity)}>{f.severity}</Pill>
                <span className="num label-xs text-muted-foreground">{f.id}</span>
              </div>
              <h3 className="mt-4 flex items-center gap-2 text-lg font-bold">
                <CircleAlert className="h-4 w-4 text-muted-foreground" strokeWidth={2.4} />
                {f.type}
              </h3>
              <p className="num mt-1 text-sm text-muted-foreground">
                {f.location} · Route {f.routeNumber}
              </p>
              <p className="mt-4 text-sm leading-relaxed">{f.impact}</p>
              <p className="label-xs mt-5 text-secondary">{f.status}</p>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
