"use client";
import SortTable from "./SortTable";

export default function GroupsTable({ rows }) {
  const columns = [
    { key: "group", label: "Ownership group", format: "text", link: (r) => `/schools?group=${encodeURIComponent(r.group)}`, meta: (r) => `${r.schoolCount} school${r.schoolCount === 1 ? "" : "s"}` },
    { key: "students", label: "Students" },
    { key: "netChange", label: "Net change", format: "signed" },
    { key: "churnRate", label: "Churn rate", format: "pct" },
    { key: "winBack", label: "Win-back", format: "pct0" },
    { key: "retentionL12m", label: "Retention (12-mo)", format: "pct" },
    { key: "revenue", label: "Revenue", format: "money" },
    { key: "ltv", label: "Lifetime value", format: "money" },
  ];
  return <SortTable rows={rows} columns={columns} initialSort="students" />;
}
