import GroupsTable from "../../components/GroupsTable";
import { groups, schools, latest, monthLabel, fmtPct } from "../../lib/data";

export const metadata = { title: "Ownership groups · GOLD Insights" };

export default function Groups() {
  const counts = schools.reduce((m, s) => ((m[s.group] = (m[s.group] || 0) + 1), m), {});
  const rows = groups.map((g) => ({ ...g, key: g.group, schoolCount: counts[g.group] || 0 }));
  const sized = rows.filter((g) => g.students >= 1000);
  const top = [...sized].sort((a, b) => b.retentionL12m - a.retentionL12m)[0];
  const bottom = [...sized].sort((a, b) => a.retentionL12m - b.retentionL12m)[0];
  return (
    <>
      <div className="page-head">
        <h1>Ownership groups</h1>
        <p>
          All {groups.length} franchise ownership groups for {monthLabel(latest.month, true)}. Click a group to see
          its schools.
        </p>
      </div>
      <div className="callout" style={{ marginBottom: 16 }}>
        Among groups with 1,000+ students, <strong>{top.group}</strong> has the strongest 12-month retention (
        {fmtPct(top.retentionL12m)}) and <strong>{bottom.group}</strong> the weakest ({fmtPct(bottom.retentionL12m)}).
      </div>
      <div className="card">
        <GroupsTable rows={rows} />
      </div>
    </>
  );
}
