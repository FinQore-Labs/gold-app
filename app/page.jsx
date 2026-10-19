import Kpi from "../components/Kpi";
import { TrendChart, MovementChart } from "../components/Charts";
import {
  latest, yearAgo, networkRows, regionRows, REGIONS, last12, sum, schools,
  monthLabel, fmtInt, fmtPct, fmtMoney, fmtPts, fmtSigned,
} from "../lib/data";

const pctChange = (a, b) => (b ? (a - b) / b : null);
const changeText = (a, b, vs) => {
  const c = pctChange(a, b);
  return c == null ? null : `${c > 0 ? "▲" : c < 0 ? "▼" : ""} ${fmtPct(Math.abs(c))} vs ${vs}`;
};

export default function Overview() {
  const vs = monthLabel(yearAgo.month);
  const regionNow = REGIONS.map((r) => regionRows.find((x) => x.region === r && x.month === latest.month));
  const growing = schools.filter((s) => s.growth12 > 0).length;
  const churn12 = sum(last12, "churned");
  const react12 = sum(last12, "reactivated");
  const best = [...regionNow].sort((a, b) => b.retentionL12m - a.retentionL12m)[0];

  return (
    <>
      <div className="page-head">
        <h1>Network overview</h1>
        <p>
          How the GOLD network of {schools.length} schools is doing as of {monthLabel(latest.month, true)}.
          Changes compare to the same month last year, since swim enrollment is seasonal.
        </p>
      </div>

      <div className="grid kpis">
        <Kpi label="Active students" value={fmtInt(latest.students)}
          change={latest.students - yearAgo.students} changeLabel={changeText(latest.students, yearAgo.students, vs)} />
        <Kpi label="Monthly revenue" value={fmtMoney(latest.revenue, true)}
          change={latest.revenue - yearAgo.revenue} changeLabel={changeText(latest.revenue, yearAgo.revenue, vs)} />
        <Kpi label="New students" value={fmtInt(latest.new)}
          change={latest.new - yearAgo.new} changeLabel={changeText(latest.new, yearAgo.new, vs)} />
        <Kpi label="Reactivated" value={fmtInt(latest.reactivated)}
          change={latest.reactivated - yearAgo.reactivated} changeLabel={changeText(latest.reactivated, yearAgo.reactivated, vs)} />
        <Kpi label="Churned" value={fmtInt(latest.churned)} good="down"
          change={latest.churned - yearAgo.churned} changeLabel={changeText(latest.churned, yearAgo.churned, vs)} />
        <Kpi label="Retention (12-mo avg)" value={fmtPct(latest.retentionL12m)}
          change={latest.retentionL12m - yearAgo.retentionL12m}
          changeLabel={`${fmtPts(latest.retentionL12m - yearAgo.retentionL12m)} vs ${vs}`} />
      </div>

      <div className="callout">
        Over the last 12 months the network lost <strong>{fmtInt(churn12)}</strong> students and won back{" "}
        <strong>{fmtInt(react12)}</strong> — about <strong>{fmtPct(react12 / churn12, 0)}</strong> as many as it lost.{" "}
        <strong>{growing}</strong> of {schools.length} schools have more students than a year ago, and{" "}
        <strong>{best.region}</strong> has the strongest retention ({fmtPct(best.retentionL12m)}).
      </div>

      <div className="grid two section">
        <div className="card">
          <h2>Active students</h2>
          <p className="sub">End of month, last 24 months</p>
          <TrendChart data={networkRows} series={[{ key: "students", label: "Active students", color: "var(--s1)" }]} />
        </div>
        <div className="card">
          <h2>Students gained and lost</h2>
          <p className="sub">New and reactivated students vs. churned, each month</p>
          <MovementChart data={networkRows} height={248} />
        </div>
      </div>

      <div className="card section">
        <h2>By region · {monthLabel(latest.month, true)}</h2>
        <p className="sub">Churn rate is churned students over students at the start of the month</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Region</th><th>Students</th><th>New</th><th>Reactivated</th><th>Churned</th>
                <th>Net change</th><th>Churn rate</th><th>Retention (12-mo)</th><th>Revenue</th>
              </tr>
            </thead>
            <tbody className="num">
              {regionNow.map((r) => (
                <tr key={r.region}>
                  <td>{r.region}</td>
                  <td>{fmtInt(r.students)}</td>
                  <td>{fmtInt(r.new)}</td>
                  <td>{fmtInt(r.reactivated)}</td>
                  <td>{fmtInt(r.churned)}</td>
                  <td>{fmtSigned(r.netChange)}</td>
                  <td>{fmtPct(r.churnRate)}</td>
                  <td>{fmtPct(r.retentionL12m)}</td>
                  <td>{fmtMoney(r.revenue, true)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
