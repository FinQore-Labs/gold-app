import Explorer from "../../components/Explorer";
import { schools, groups, regionRows, latest, monthLabel } from "../../lib/data";

export const metadata = { title: "Ask your data · GOLD Insights" };

const pick = (r, name) => ({
  name, region: r.region ?? null, beginning: r.beginning, students: r.students, new: r.new,
  reactivated: r.reactivated, churned: r.churned, churnRate: r.churnRate, retentionL12m: r.retentionL12m,
  revenue: r.revenue ?? null, ltv: r.ltv ?? null,
});

export default function Explore() {
  const data = {
    schools: schools.map((s) => ({ ...pick(s, s.school), slug: s.slug, growth12: s.growth12, churned12: s.churned12, winBack12: s.winBack12 })),
    groups: groups.map((g) => ({ ...pick(g, g.group), region: null })),
    regions: regionRows.filter((r) => r.month === latest.month).map((r) => pick(r, r.region)),
  };
  return (
    <>
      <div className="page-head">
        <h1>Ask your data</h1>
        <p>
          Type a question or pick one below to rank schools, ownership groups or regions. Answers come from the{" "}
          {monthLabel(latest.month, true)} FinQore snapshot in this app.
        </p>
      </div>
      <Explorer data={data} asOfLabel={monthLabel(latest.month, true)} />
    </>
  );
}
