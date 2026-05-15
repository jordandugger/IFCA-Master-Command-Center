import { NextResponse } from "next/server";

export const revalidate = 120;
import { fetchPif }         from "@/app/api/pif/route";
import { fetchHyros }       from "@/app/api/hyros/route";
import { fetchProjections } from "@/app/api/projections/route";
import { fetchBackend }     from "@/app/api/backend/route";

// ── Constraint Engine ──────────────────────────────────────────────────────
// A constraint is an off-KPI metric ranked by:
//   severity   (red/amber/green)
//   impact$    (estimated revenue dollars at stake if metric were on-target)
//   trend      (improving/worsening/stable — heuristic from variance)

export type Severity = "red" | "amber" | "green";

export interface Constraint {
  pillar: "ads" | "sales" | "backend" | "health" | "revenue";
  metric: string;
  actual: string;
  target: string;
  variancePct: number;
  impact$: number;
  severity: Severity;
  reason: string;          // one-liner: "Show rate -9pts vs target"
  drillTo: string;         // tab name to navigate to
}

export interface PillarHealth {
  pillar: string;
  score: Severity;
  reason: string;
  greenCount: number;
  totalCount: number;
}

export interface MissionControlSummary {
  asOf: string;
  month: string;
  daysInMonth: number;
  currentDay: number;
  daysRemaining: number;
  // Lookback ($550K, 120-day target starting May 10, 2026)
  lookback: {
    target: number;
    startedOn: string;
    totalDays: number;
    dayNumber: number;
    planBDate: string;
    daysToPlanB: number;
    mtdGenerated: number;
    mtdProjection: number;
    mtdPace: number;
    gap$: number;
    progressPct: number;
  };
  revenue: {
    mtdGenerated: number;
    mtdProjection: number;
    mtdPace: number;
    variancePct: number;
    daysToProj$Day: number;
  };
  pillarHealth: PillarHealth[];
  constraints: Constraint[];
  meta: {
    pifOk: boolean;
    hyrosOk: boolean;
    projectionsOk: boolean;
    backendOk: boolean;
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────
function scorePillar(constraints: Constraint[], pillar: Constraint["pillar"], totalMetrics: number): PillarHealth {
  const pillarConstraints = constraints.filter(c => c.pillar === pillar);
  const reds   = pillarConstraints.filter(c => c.severity === "red").length;
  const ambers = pillarConstraints.filter(c => c.severity === "amber").length;
  const greens = totalMetrics - reds - ambers;
  let score: Severity = "green";
  if (reds >= 1 || ambers >= 3) score = "red";
  else if (ambers >= 1) score = "amber";

  const topIssue = pillarConstraints[0];
  const reason = score === "green"
    ? `${greens}/${totalMetrics} metrics on target`
    : topIssue?.reason ?? "Off-target";

  return { pillar, score, reason, greenCount: greens, totalCount: totalMetrics };
}

// Sort constraints by severity (red first), then by absolute revenue impact
function rankConstraints(constraints: Constraint[]): Constraint[] {
  const sevOrder: Record<Severity, number> = { red: 0, amber: 1, green: 2 };
  return constraints.sort((a, b) => {
    if (sevOrder[a.severity] !== sevOrder[b.severity]) return sevOrder[a.severity] - sevOrder[b.severity];
    return Math.abs(b.impact$) - Math.abs(a.impact$);
  });
}

// ── Main GET ───────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const results = await Promise.allSettled([
      fetchPif(),
      fetchHyros(),
      fetchProjections(),
      fetchBackend(),
    ]);
    const errors: string[] = [];
    results.forEach((r, i) => {
      const name = ["pif", "hyros", "projections", "backend"][i];
      if (r.status === "rejected") errors.push(`${name}:${String(r.reason).slice(0, 80)}`);
      else if (r.value === null) errors.push(`${name}:null`);
    });
    const pif   = results[0].status === "fulfilled" ? results[0].value : null;
    const hyros = results[1].status === "fulfilled" ? results[1].value : null;
    const proj  = results[2].status === "fulfilled" ? results[2].value : null;
    const be    = results[3].status === "fulfilled" ? results[3].value : null;

    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay  = now.getDate();
    const daysRemaining = daysInMonth - currentDay;

    // ── Lookback math ($550K target, 120-day window from May 10, 2026)
    const lookbackTarget = 550000;
    const lookbackStart  = new Date(2026, 4, 10); // May 10
    const dayNumber = Math.floor((now.getTime() - lookbackStart.getTime()) / 86400000) + 1;
    const planBDate = new Date(lookbackStart.getTime() + 120 * 86400000);
    const daysToPlanB = Math.floor((planBDate.getTime() - now.getTime()) / 86400000);
    const mtdGenerated  = proj?.totals.totalGenRev      ?? 0;
    const mtdProjection = proj?.totals.totalGenRevProj  ?? 0;
    const mtdPace       = proj?.revenue.find(r => r.label.includes("Total Generated"))?.pace ?? 0;
    const gap$ = lookbackTarget - mtdPace;
    const progressPct = lookbackTarget > 0 ? (mtdPace / lookbackTarget) * 100 : 0;

    // ── Revenue Pulse
    const revenueVariance = mtdProjection > 0 ? ((mtdGenerated - mtdProjection) / mtdProjection) * 100 : 0;
    const dailyTarget = mtdProjection / daysInMonth;
    const daysToProj$Day = dailyTarget > 0 ? (mtdGenerated / dailyTarget) : 0;

    // ── Constraint Engine ────────────────────────────────────────────────────
    const constraints: Constraint[] = [];
    const aov = proj?.totals.aov || 12500;

    // SALES pillar (PIF + projection metrics)
    if (pif?.totals) {
      const closeRate = parseFloat(pif.totals.closeRate.replace("%", ""));
      const showRate  = parseFloat(pif.totals.showRate.replace("%", ""));
      const totalSets = pif.totals.totalSets;

      // Close rate target: 25%
      if (closeRate < 25) {
        const closesGap = Math.max(0, (25 - closeRate) * (pif.totals.showed / 100));
        constraints.push({
          pillar: "sales",
          metric: "Close Rate",
          actual: pif.totals.closeRate,
          target: "25%",
          variancePct: closeRate - 25,
          impact$: closesGap * aov,
          severity: closeRate < 18 ? "red" : "amber",
          reason: `Close rate ${pif.totals.closeRate} vs 25% target (-${(25 - closeRate).toFixed(1)}pts)`,
          drillTo: "sales",
        });
      }

      // Show rate target: 66%
      if (showRate < 66 && showRate > 0) {
        const livesGap = Math.max(0, (66 - showRate) * (pif.totals.scheduled / 100));
        const expectedCloses = livesGap * 0.25; // at target close rate
        constraints.push({
          pillar: "sales",
          metric: "Show Rate",
          actual: pif.totals.showRate,
          target: "66%",
          variancePct: showRate - 66,
          impact$: expectedCloses * aov,
          severity: showRate < 55 ? "red" : "amber",
          reason: `Show rate ${pif.totals.showRate} vs 66% target (-${(66 - showRate).toFixed(1)}pts)`,
          drillTo: "sales",
        });
      }

      // Sets target: 115-130
      if (totalSets > 0 && totalSets < 115 && currentDay > 7) {
        const setsPace = (totalSets / currentDay) * daysInMonth;
        if (setsPace < 115) {
          const setsGap = 115 - setsPace;
          constraints.push({
            pillar: "sales",
            metric: "Sets Booked",
            actual: String(totalSets),
            target: "115–130",
            variancePct: ((setsPace - 115) / 115) * 100,
            impact$: setsGap * 0.66 * 0.25 * aov, // sets → lives → closes → $
            severity: setsPace < 90 ? "red" : "amber",
            reason: `Sets pacing ${Math.round(setsPace)} vs 115 target (-${Math.round(115 - setsPace)})`,
            drillTo: "sales",
          });
        }
      }
    }

    // ADS pillar (Hyros)
    if (hyros?.totals) {
      const cpl = hyros.totals.cpl;
      const costPerCall = hyros.totals.costPerCall;
      const roas = hyros.totals.roas;

      if (cpl > 50 && cpl > 0) {
        constraints.push({
          pillar: "ads",
          metric: "Cost Per Lead",
          actual: `$${cpl.toFixed(2)}`,
          target: "$38–50",
          variancePct: ((cpl - 50) / 50) * 100,
          impact$: (cpl - 44) * hyros.totals.leads,  // overspend on leads vs $44 mid-target
          severity: cpl > 79 ? "red" : "amber",
          reason: `CPL $${cpl.toFixed(0)} vs $50 target (+${((cpl - 50) / 50 * 100).toFixed(0)}%)`,
          drillTo: "ads",
        });
      }

      if (costPerCall > 350 && costPerCall > 0) {
        constraints.push({
          pillar: "ads",
          metric: "Cost Per Booked Call",
          actual: `$${costPerCall.toFixed(0)}`,
          target: "$350",
          variancePct: ((costPerCall - 350) / 350) * 100,
          impact$: (costPerCall - 350) * hyros.totals.calls,
          severity: costPerCall > 500 ? "red" : "amber",
          reason: `Cost/Call $${costPerCall.toFixed(0)} vs $350 target`,
          drillTo: "ads",
        });
      }

      if (roas > 0 && roas < 2) {
        constraints.push({
          pillar: "ads",
          metric: "ROAS Collected",
          actual: `${roas.toFixed(2)}x`,
          target: "2.0x",
          variancePct: ((roas - 2) / 2) * 100,
          impact$: (2 - roas) * hyros.totals.spend,
          severity: roas < 1.2 ? "red" : "amber",
          reason: `ROAS ${roas.toFixed(2)}x vs 2.0x target`,
          drillTo: "ads",
        });
      }
    }

    // BACKEND pillar
    if (be?.teamTotals) {
      const fePct = be.teamTotals.fePct;
      const bePct = be.teamTotals.bePct;
      const totalPct = be.teamTotals.totalPct;
      const cashRate = be.teamTotals.collectedPct;

      if (totalPct < 20 && be.teamTotals.totalContractsEnding > 0) {
        const upsellsGap = Math.max(0, (25 - totalPct) / 100 * be.teamTotals.totalContractsEnding);
        constraints.push({
          pillar: "backend",
          metric: "Total Resell %",
          actual: `${totalPct.toFixed(1)}%`,
          target: "25%",
          variancePct: ((totalPct - 25) / 25) * 100,
          impact$: upsellsGap * 18000, // avg BE deal ~$18K
          severity: totalPct < 12 ? "red" : "amber",
          reason: `BE resell ${totalPct.toFixed(1)}% vs 25% target`,
          drillTo: "backend",
        });
      }

      if (cashRate > 0 && cashRate < 25) {
        constraints.push({
          pillar: "backend",
          metric: "BE Cash Collection Rate",
          actual: `${cashRate.toFixed(1)}%`,
          target: "30%",
          variancePct: ((cashRate - 30) / 30) * 100,
          impact$: (30 - cashRate) / 100 * be.teamTotals.contracted,
          severity: cashRate < 15 ? "red" : "amber",
          reason: `BE cash rate ${cashRate.toFixed(1)}% vs 30% target`,
          drillTo: "backend",
        });
      }
    }

    // HEALTH pillar
    if (be?.clientHealth) {
      const churn = be.clientHealth.totalChurnPct;
      const retention = be.clientHealth.retentionPct;

      if (churn > 15) {
        constraints.push({
          pillar: "health",
          metric: "Total Churn %",
          actual: `${churn.toFixed(1)}%`,
          target: "<10%",
          variancePct: ((churn - 10) / 10) * 100,
          impact$: (churn - 10) / 100 * be.clientHealth.totalActive * 500, // approx avg monthly value
          severity: churn > 20 ? "red" : "amber",
          reason: `Churn ${churn.toFixed(1)}% vs <10% target`,
          drillTo: "backend",
        });
      }

      if (retention > 0 && retention < 85) {
        constraints.push({
          pillar: "health",
          metric: "Retention %",
          actual: `${retention.toFixed(1)}%`,
          target: ">85%",
          variancePct: ((retention - 85) / 85) * 100,
          impact$: 0,
          severity: retention < 80 ? "red" : "amber",
          reason: `Retention ${retention.toFixed(1)}% vs 85% target`,
          drillTo: "backend",
        });
      }

      if (be.npsAverage > 0 && be.npsAverage < 8) {
        constraints.push({
          pillar: "health",
          metric: "NPS",
          actual: `${be.npsAverage.toFixed(1)}/10`,
          target: "≥8.0",
          variancePct: ((be.npsAverage - 8) / 8) * 100,
          impact$: 0,
          severity: be.npsAverage < 7 ? "red" : "amber",
          reason: `NPS ${be.npsAverage.toFixed(1)} below 8.0 (n=${be.npsCount})`,
          drillTo: "backend",
        });
      }
    }

    // REVENUE pillar — overall pace vs projection
    if (revenueVariance < -10 && mtdProjection > 0) {
      const gapDollars = mtdProjection - mtdGenerated;
      constraints.push({
        pillar: "revenue",
        metric: "Total Generated Revenue",
        actual: `$${(mtdGenerated / 1000).toFixed(1)}K`,
        target: `$${(mtdProjection / 1000).toFixed(1)}K`,
        variancePct: revenueVariance,
        impact$: gapDollars,
        severity: revenueVariance < -25 ? "red" : "amber",
        reason: `Revenue pacing ${revenueVariance.toFixed(0)}% under projection`,
        drillTo: "projections",
      });
    }

    const ranked = rankConstraints(constraints);

    // ── Pillar Health Scores ─────────────────────────────────────────────────
    const pillarHealth: PillarHealth[] = [
      scorePillar(ranked, "ads", 3),
      scorePillar(ranked, "sales", 3),
      scorePillar(ranked, "backend", 2),
      scorePillar(ranked, "health", 3),
    ];

    const summary: MissionControlSummary = {
      asOf: now.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      month: now.toLocaleString("en-US", { month: "long" }),
      daysInMonth, currentDay, daysRemaining,
      lookback: {
        target: lookbackTarget,
        startedOn: "May 10, 2026",
        totalDays: 120,
        dayNumber,
        planBDate: planBDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        daysToPlanB,
        mtdGenerated,
        mtdProjection,
        mtdPace,
        gap$,
        progressPct,
      },
      revenue: {
        mtdGenerated,
        mtdProjection,
        mtdPace,
        variancePct: revenueVariance,
        daysToProj$Day,
      },
      pillarHealth,
      constraints: ranked.slice(0, 8),
      meta: {
        pifOk: !!pif,
        hyrosOk: !!hyros,
        projectionsOk: !!proj,
        backendOk: !!be,
        errors,
      } as { pifOk: boolean; hyrosOk: boolean; projectionsOk: boolean; backendOk: boolean; errors?: string[] },
    };

    return NextResponse.json(summary);
  } catch (err) {
    console.error("MissionControl error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
