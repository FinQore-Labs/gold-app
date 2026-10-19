"use client";
import SortTable from "./SortTable";

export default function SchoolRankings({ rows, latestLabel }) {
  const columns = [
    { key: "school", label: "School", format: "text", link: (r) => `/schools/${r.slug}`, meta: (r) => `${r.region ?? "—"} · ${r.group}` },
    { key: "churnRate", label: `Churn rate (${latestLabel})`, format: "pct" },
    { key: "churned", label: `Churned (${latestLabel})` },
    { key: "churned12", label: "Churned (12-mo)" },
    { key: "reactivated12", label: "Reactivated (12-mo)" },
    { key: "winBack12", label: "Win-back (12-mo)", format: "pct0" },
  ];
  return <SortTable rows={rows} columns={columns} initialSort="churnRate" limit={15} />;
}
