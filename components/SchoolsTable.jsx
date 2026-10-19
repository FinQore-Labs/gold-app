"use client";
import { useMemo, useState } from "react";
import SortTable from "./SortTable";

export default function SchoolsTable({ rows, regions, groups, initialGroup = "" }) {
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [group, setGroup] = useState(initialGroup);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (!q || r.school.toLowerCase().includes(q.toLowerCase())) &&
          (!region || r.region === region) &&
          (!group || r.group === group)
      ),
    [rows, q, region, group]
  );

  const columns = [
    {
      key: "school", label: "School", format: "text", link: (r) => `/schools/${r.slug}`,
      meta: (r) => `${r.region ?? "—"} · ${r.group}${r.vintage === "Under 90 Days" ? " · new" : ""}`,
    },
    { key: "students", label: "Students" },
    { key: "growth12", label: "vs Oct 25", format: "pct" },
    { key: "new", label: "New" },
    { key: "reactivated", label: "Reactivated" },
    { key: "churned", label: "Churned" },
    { key: "churnRate", label: "Churn rate", format: "pct" },
    { key: "retentionL12m", label: "Retention (12-mo)", format: "pct" },
    { key: "revenue", label: "Revenue", format: "money" },
    { key: "ltv", label: "Lifetime value", format: "money" },
  ];

  const download = () => {
    const keys = ["school", "group", "region", "vintage", "students", "new", "reactivated", "churned", "churnRate", "retentionL12m", "revenue", "ltv"];
    const esc = (v) => (v == null ? "" : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v);
    const csv = [keys.join(","), ...filtered.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "gold-schools.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="controls">
        <input type="search" placeholder="Search schools…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search schools" />
        <label>
          Region
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">All regions</option>
            {regions.map((r) => <option key={r}>{r}</option>)}
          </select>
        </label>
        <label>
          Ownership group
          <select value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="">All groups</option>
            {groups.map((g) => <option key={g}>{g}</option>)}
          </select>
        </label>
        <span style={{ fontSize: 13, color: "var(--text-3)" }}>{filtered.length} schools</span>
        <button className="btn" onClick={download} style={{ marginLeft: "auto" }}>Download CSV</button>
      </div>
      <SortTable rows={filtered} columns={columns} initialSort="students" />
    </>
  );
}
