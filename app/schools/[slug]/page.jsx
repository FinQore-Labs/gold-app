import { notFound } from "next/navigation";
import Link from "next/link";
import Kpi from "../../../components/Kpi";
import { TrendChart, MovementChart } from "../../../components/Charts";
import { schools, schoolBySlug, schoolTrend, regionRows, latest, monthLabel, fmtInt, fmtPct, fmtMoney } from "../../../lib/data";

export const dynamicParams = false;
export function generateStaticParams() {
  return schools.map((s) => ({ slug: s.slug }));
}
export async function generateMetadata({ params }) {
  const { slug } = await params;
  return { title: `${schoolBySlug[slug]?.school ?? "School"} · GOLD Insights` };
}

export default async function School({ params }) {
  const { slug } = await params;
  const s = schoolBySlug[slug];
  if (!s) notFound();
  const trend = schoolTrend[s.school] || [];
  const region = regionRows.find((r) => r.region === s.region && r.month === latest.month);
  const peers = schools.filter((x) => x.group === s.group);
  const rank = [...schools].sort((a, b) => b.students - a.students).findIndex((x) => x.slug === s.slug) + 1;
  const churnTrend = trend.map((t) => ({ month: t.month, churnRate: t.churnRate }));

  return (
    <>
      <div className="page-head">
        <div className="crumb"><Link href="/schools">Schools</Link> / {s.region ?? "No region"}</div>
        <h1>
          {s.school}
          {s.vintage === "Under 90 Days" && <span className="tag">Opened in the last 90 days</span>}
        </h1>
        <p>
          {s.group} · {s.region ?? "No region assigned"} · open {s.vintage?.toLowerCase() ?? "—"} ·
          #{rank} of {schools.length} schools by students
        </p>
      </div>

      <div className="grid kpis">
        <Kpi label={`Students · ${monthLabel(latest.month)}`} value={fmtInt(s.students)}
          change={s.growth12} changeLabel={s.growth12 == null ? null : `${s.growth12 > 0 ? "▲" : "▼"} ${fmtPct(Math.abs(s.growth12))} vs ${monthLabel(trend[0]?.month ?? "2025-10")}`} />
        <Kpi label="Churn rate" value={fmtPct(s.churnRate)} good="down"
          change={region ? s.churnRate - region.churnRate : null}
          changeLabel={region ? `Region: ${fmtPct(region.churnRate)}` : null} />
        <Kpi label="Retention (12-mo avg)" value={fmtPct(s.retentionL12m)}
          change={region ? s.retentionL12m - region.retentionL12m : null}
          changeLabel={region ? `Region: ${fmtPct(region.retentionL12m)}` : null} />
        <Kpi label="Win-back (12-mo)" value={fmtPct(s.winBack12, 0)}
          changeLabel={`${fmtInt(s.reactivated12)} back of ${fmtInt(s.churned12)} lost`} />
        <Kpi label="Monthly revenue" value={fmtMoney(s.revenue, true)} changeLabel={`${fmtMoney(s.arpc)} per student`} />
        <Kpi label="Lifetime value" value={fmtMoney(s.ltv)} changeLabel={s.ltv == null ? "Not shown for schools under a year old" : "Expected revenue per student"} />
      </div>

      <div className="grid two">
        <div className="card">
          <h2>Active students</h2>
          <p className="sub">End of month, last 12 months</p>
          <TrendChart data={trend} series={[{ key: "students", label: "Active students", color: "var(--s1)" }]} />
        </div>
        <div className="card">
          <h2>Students gained and lost</h2>
          <p className="sub">New and reactivated vs. churned</p>
          <MovementChart data={trend} height={248} />
        </div>
      </div>

      <div className="grid two section">
        <div className="card">
          <h2>Monthly churn rate</h2>
          <p className="sub">Churned ÷ students at start of month</p>
          <TrendChart data={churnTrend} format="pct" height={220} series={[{ key: "churnRate", label: "Churn rate", color: "var(--loss)" }]} />
        </div>
        <div className="card">
          <h2>Other {s.group} schools</h2>
          <p className="sub">{peers.length} school{peers.length === 1 ? "" : "s"} in this ownership group{peers.length > 10 ? ", largest 10 shown" : ""}</p>
          <div className="table-wrap">
            <table>
              <thead><tr><th>School</th><th>Students</th><th>Churn rate</th><th>Retention</th></tr></thead>
              <tbody className="num">
                {peers.sort((a, b) => b.students - a.students).filter((p, i) => i < 10 || p.slug === s.slug).map((p) => (
                  <tr key={p.slug}>
                    <td>{p.slug === s.slug ? <strong>{p.school}</strong> : <Link href={`/schools/${p.slug}`}>{p.school}</Link>}</td>
                    <td>{fmtInt(p.students)}</td>
                    <td>{fmtPct(p.churnRate)}</td>
                    <td>{fmtPct(p.retentionL12m)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {peers.length > 10 && (
            <p style={{ margin: "12px 0 0", fontSize: 13.5 }}>
              <Link href={`/schools?group=${encodeURIComponent(s.group)}`}>See all {peers.length} schools →</Link>
            </p>
          )}
        </div>
      </div>
    </>
  );
}
