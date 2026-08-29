import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BatteryCharging, IdCard, Wrench } from "lucide-react";
import {
  DataTable,
  Metric,
  Meter,
  PageHead,
  Panel,
  Pill,
  Td,
  Th,
} from "@/components/transit/primitives";
import { crewTone, fleetTone } from "@/lib/transit-ui";
import { CREW_ROSTER, FLEET_INVENTORY } from "@/data/transitData";

export const Route = createFileRoute("/fleet")({
  head: () => ({
    meta: [
      { title: "Fleet & Crew — DTC TransitOps" },
      {
        name: "description",
        content:
          "Vehicle availability, state of charge, maintenance windows and CMVR-compliant crew duty hours for DTC depots.",
      },
      { property: "og:title", content: "Fleet & Crew — DTC TransitOps" },
      {
        property: "og:description",
        content: "Vehicle availability, maintenance windows and crew duty-hour compliance.",
      },
    ],
  }),
  component: FleetCrew,
});

function FleetCrew() {
  const [tab, setTab] = useState<"fleet" | "crew">("fleet");

  const available = FLEET_INVENTORY.filter((v) => v.status === "Standby").length;
  const workshop = FLEET_INVENTORY.filter(
    (v) => v.status === "Scheduled Maintenance" || v.status === "Breakdown",
  ).length;
  const restCrew = CREW_ROSTER.filter((c) => c.status === "Rest Period").length;
  const overSpread = CREW_ROSTER.filter((c) => c.dailySpreadoverHours > 11).length;

  return (
    <div className="space-y-8">
      <PageHead
        eyebrow="Resource pool"
        title="Fleet & crew"
        description="Vehicle health and duty-hour compliance feed straight into the solver — a bus in the workshop or a driver at 12 hours is never assigned."
        aside={
          <div className="flex gap-2 rounded-md bg-muted p-1.5">
            {(["fleet", "crew"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`label-xs rounded-sm px-5 py-3 transition-all duration-200 hover:scale-105 ${
                  tab === t ? "bg-ink text-ink-foreground" : "text-muted-foreground"
                }`}
              >
                {t === "fleet" ? "Vehicles" : "Crew roster"}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Vehicles tracked"
          value={FLEET_INVENTORY.length}
          tone="primary"
          icon={<BatteryCharging className="h-5 w-5" strokeWidth={2.4} />}
        />
        <Metric label="Standby pool" value={available} tone="secondary" delta="Ready for recovery" />
        <Metric
          label="In workshop"
          value={workshop}
          tone="accent"
          icon={<Wrench className="h-5 w-5" strokeWidth={2.4} />}
        />
        <Metric
          label="Spreadover risk"
          value={overSpread}
          tone={overSpread ? "destructive" : "secondary"}
          delta={`${restCrew} crew currently in mandated rest`}
          icon={<IdCard className="h-5 w-5" strokeWidth={2.4} />}
        />
      </div>

      {tab === "fleet" ? (
        <Panel title="Vehicle inventory" hint="Live state of charge / fuel, odometer and next inspection.">
          <DataTable
            head={
              <>
                <Th>Registration</Th>
                <Th>Type</Th>
                <Th>Depot</Th>
                <Th className="w-40">Charge / fuel</Th>
                <Th className="text-right">Odometer</Th>
                <Th>Assignment</Th>
                <Th>Status</Th>
              </>
            }
          >
            {FLEET_INVENTORY.map((v) => (
              <tr key={v.id} className="transition-colors duration-200 hover:bg-muted">
                <Td>
                  <p className="num font-semibold">{v.regNumber}</p>
                  <p className="text-xs text-muted-foreground">{v.model}</p>
                </Td>
                <Td className="text-muted-foreground">{v.type}</Td>
                <Td className="text-muted-foreground">{v.depot}</Td>
                <Td>
                  <p className="num text-sm font-semibold">{v.socOrFuelPct}%</p>
                  <Meter
                    value={v.socOrFuelPct}
                    tone={v.socOrFuelPct < 25 ? "destructive" : v.socOrFuelPct < 55 ? "accent" : "secondary"}
                    className="mt-1.5"
                  />
                </Td>
                <Td className="num text-right">{v.odometerKm.toLocaleString("en-IN")}</Td>
                <Td className="text-muted-foreground">{v.currentAssignment ?? "—"}</Td>
                <Td>
                  <Pill tone={fleetTone(v.status)}>{v.status}</Pill>
                </Td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      ) : (
        <Panel title="Crew roster" hint="Weekly hours, spreadover and licence validity under CMVR rules.">
          <DataTable
            head={
              <>
                <Th>Badge</Th>
                <Th>Role</Th>
                <Th>Depot</Th>
                <Th className="w-44">Spreadover today</Th>
                <Th className="text-right">Weekly hrs</Th>
                <Th className="text-right">Punctuality</Th>
                <Th>Status</Th>
              </>
            }
          >
            {CREW_ROSTER.map((c) => {
              const spread = Math.round((c.dailySpreadoverHours / 12) * 100);
              return (
                <tr key={c.id} className="transition-colors duration-200 hover:bg-muted">
                  <Td>
                    <p className="font-semibold">{c.name}</p>
                    <p className="num text-xs text-muted-foreground">{c.badgeNumber}</p>
                  </Td>
                  <Td className="text-muted-foreground">{c.role}</Td>
                  <Td className="text-muted-foreground">{c.depot}</Td>
                  <Td>
                    <p className="num text-sm font-semibold">{c.dailySpreadoverHours} h / 12 h</p>
                    <Meter
                      value={spread}
                      tone={spread > 92 ? "destructive" : spread > 75 ? "accent" : "primary"}
                      className="mt-1.5"
                    />
                  </Td>
                  <Td className="num text-right">{c.weeklyHours}</Td>
                  <Td className="num text-right font-semibold text-secondary">
                    {c.punctualityScore}%
                  </Td>
                  <Td>
                    <Pill tone={crewTone(c.status)}>{c.status}</Pill>
                  </Td>
                </tr>
              );
            })}
          </DataTable>
        </Panel>
      )}
    </div>
  );
}
