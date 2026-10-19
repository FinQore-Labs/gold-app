import SchoolsTable from "../../components/SchoolsTable";
import { schools, groups, REGIONS, latest, monthLabel } from "../../lib/data";

export const metadata = { title: "Schools · GOLD Insights" };

export default async function Schools({ searchParams }) {
  const sp = await searchParams;
  const rows = schools.map(({ school, slug, group, region, vintage, students, new: n, reactivated, churned, churnRate, retentionL12m, revenue, ltv, growth12 }) => ({
    school, slug, group, region, vintage, students, new: n, reactivated, churned, churnRate, retentionL12m, revenue, ltv, growth12,
  }));
  return (
    <>
      <div className="page-head">
        <h1>Schools</h1>
        <p>
          All {schools.length} schools for {monthLabel(latest.month, true)}. Search, filter, sort, or click a school
          for its 12-month history.
        </p>
      </div>
      <div className="card">
        <SchoolsTable rows={rows} regions={REGIONS} groups={groups.map((g) => g.group).sort()} initialGroup={sp?.group || ""} />
      </div>
    </>
  );
}
