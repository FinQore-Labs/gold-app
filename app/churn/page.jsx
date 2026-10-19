import { TrendChart } from "../../components/Charts";
import SchoolRankings from "../../components/SchoolRankings";
import {
  networkRows, regionRows, REGIONS, latest, yearAgo, last12, sum, schools,
  monthLabel, fmtInt, fmtPct, fmtPts,
} from "../../lib/data";

export const metadata = { title: "Churn & reactivation · GOLD Insights" };

const COLORS = ["var(--s1)", "var(--s2)", "var(--s3)", "var(--s4)"];

export default function Churn() {
  const netTrend = networkRows.map((r) => ({ month: r.month, churnRate: r.churnRate, winBack: r.winBack }));
  const months = [...new Set(regionRows.map((r) => r.month))].sort();
  const regionTrend = months.map((m) => {
    const row = { month: m };
    REGIONS.forEach((rg) => {
      const r = regionRows.find((x) => x.month === m && x.region === rg);
      row[rg] = r?.churnRate ?? null;
    });
    return row;
  });

  const churn12 = sum(last12, "churned");
  const react12 = sum(last12, "reactivated");
  const prev12 = networkRows.slice(-24, -12);
  const churnPrev = sum(prev12, "churned");
  const reactPrev = sum(prev12, "reactivated");
  const byRate = [...last12].sort((a, b) => b.churnRate - a.churnRate);
  const peak = byRate[0];
  const low = byRate[byRate.length - 1];

  const schoolRows = schools
    .filter((s) => s.vintage !== "Under 90 Days" && s.beginning > 100)
    .map((s) => ({
      school: s.school, slug: s.slug, group: s.group, region: s.region,
      churned: s.churned, churnRate: s.churnRate, reactivated: s.reactivated,
      churned12: s.churned12, reactivated12: s.reactivated12, winBack12: s.winBack12,
    }));

  return (
    <>
      <div className="page-head">
        <h1>Churn &amp; reactivation</h1>
        <p>
          Who the network is losing, when, and how many come back. Student-level lists (names and contacts for
          win-back outreach) stay in FinQore; this app shows totals only.
        </p>
      </div>

      <div className="grid kpis">
        <div className="card kpi">
          <div className="label">Churned, last 12 months</div>
          <div className="value num">{fmtInt(churn12)}</div>
          <div className="delta num">{fmtPct((churn12 - churnPrev) / churnPrev)} {churn12 > churnPrev ? "more" : "fewer"} than the 12 months before</div>
        </div>
        <div className="card kpi">
          <div className="label">Reactivated, last 12 months</div>
          <div className="value num">{fmtInt(react12)}</div>
          <div className="delta num">{fmtPct((react12 - reactPrev) / reactPrev)} {react12 > reactPrev ? "more" : "fewer"} than the 12 months before</div>
        </div>
        <div className="card kpi">
          <div className="label">Win-back ratio (12-mo)</div>
          <div className="value num">{fmtPct(react12 / churn12, 0)}</div>
          <div className="delta">Reactivated students per churned student</div>
        </div>
        <div className="card kpi">
          <div className="label">Churn rate · {monthLabel(latest.month)}</div>
          <div className="value num">{fmtPct(latest.churnRate)}</div>
          <div className="delta num">{fmtPts(latest.churnRate - yearAgo.churnRate)} vs {monthLabel(yearAgo.month)}</div>
        </div>
      </div>

      <div className="callout">
        Churn is seasonal: it peaks at the end of the school year — the highest month in the last year was{" "}
        <strong>{monthLabel(peak.month, true)}</strong> at <strong>{fmtPct(peak.churnRate)}</strong> — and was lowest
        in <strong>{monthLabel(low.month, true)}</strong> at <strong>{fmtPct(low.churnRate)}</strong>.
      </div>

      <div className="grid two section">
        <div className="card">
          <h2>Monthly churn rate</h2>
          <p className="sub">Churned students ÷ students at start of month, network</p>
          <TrendChart data={netTrend} format="pct" series={[{ key: "churnRate", label: "Churn rate", color: "var(--loss)" }]} />
        </div>
        <div className="card">
          <h2>Churn rate by region</h2>
          <p className="sub">Last 12 months</p>
          <TrendChart data={regionTrend} format="pct"
            series={REGIONS.map((r, i) => ({ key: r, label: r, color: COLORS[i] }))} />
        </div>
      </div>

      <div className="card section">
        <h2>Win-back ratio</h2>
        <p className="sub">Reactivated students per churned student, each month — higher means more lost students are coming back</p>
        <TrendChart data={netTrend} format="pct" height={220} series={[{ key: "winBack", label: "Win-back ratio", color: "var(--s1)" }]} />
      </div>

      <div className="card section">
        <h2>Schools to watch</h2>
        <p className="sub">Schools open 90+ days with 100+ students. Click a column to sort.</p>
        <SchoolRankings rows={schoolRows} latestLabel={monthLabel(latest.month)} />
      </div>
    </>
  );
}
