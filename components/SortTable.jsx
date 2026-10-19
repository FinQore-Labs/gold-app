"use client";
import { useMemo, useState } from "react";
import Link from "next/link";

export const FMT = {
  int: (n) => (n == null ? "—" : Math.round(n).toLocaleString("en-US")),
  signed: (n) => (n == null ? "—" : `${n > 0 ? "+" : ""}${Math.round(n).toLocaleString("en-US")}`),
  pct: (n) => (n == null ? "—" : `${(n * 100).toFixed(1)}%`),
  pct0: (n) => (n == null ? "—" : `${(n * 100).toFixed(0)}%`),
  money: (n) => (n == null ? "—" : `$${Math.round(n).toLocaleString("en-US")}`),
  text: (s) => s ?? "—",
};

// columns: [{key, label, format, link?: (row)=>href, meta?: (row)=>string}]
export default function SortTable({ rows, columns, initialSort, initialDir = "desc", limit, empty = "No matches" }) {
  const [sort, setSort] = useState(initialSort || columns[1]?.key);
  const [dir, setDir] = useState(initialDir);
  const [showAll, setShowAll] = useState(false);

  const sorted = useMemo(() => {
    const out = [...rows].sort((a, b) => {
      const x = a[sort], y = b[sort];
      if (x == null && y == null) return 0;
      if (x == null) return 1;
      if (y == null) return -1;
      const c = typeof x === "string" ? x.localeCompare(y) : x - y;
      return dir === "asc" ? c : -c;
    });
    return out;
  }, [rows, sort, dir]);

  const visible = limit && !showAll ? sorted.slice(0, limit) : sorted;

  const click = (key) => {
    if (key === sort) setDir(dir === "asc" ? "desc" : "asc");
    else {
      setSort(key);
      setDir(columns.find((c) => c.key === key)?.format === "text" ? "asc" : "desc");
    }
  };

  return (
    <>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} aria-sort={sort === c.key ? (dir === "asc" ? "ascending" : "descending") : "none"}>
                  <button onClick={() => click(c.key)}>
                    {c.label}
                    <span aria-hidden="true">{sort === c.key ? (dir === "asc" ? "↑" : "↓") : ""}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="num">
            {visible.map((r, i) => (
              <tr key={r.slug || r.key || i}>
                {columns.map((c) => {
                  const v = FMT[c.format || "int"](r[c.key]);
                  return (
                    <td key={c.key}>
                      {c.link ? <Link href={c.link(r)}>{v}</Link> : v}
                      {c.meta && <span className="meta">{c.meta(r)}</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
            {!visible.length && (
              <tr><td colSpan={columns.length}>{empty}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {limit && sorted.length > limit && (
        <div style={{ marginTop: 12 }}>
          <button className="btn" onClick={() => setShowAll(!showAll)}>
            {showAll ? `Show top ${limit}` : `Show all ${sorted.length}`}
          </button>
        </div>
      )}
    </>
  );
}
