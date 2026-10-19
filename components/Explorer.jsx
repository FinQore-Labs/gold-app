"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { FMT } from "./SortTable";

const METRICS = {
  students: { label: "Active students", format: "int", noun: "active students" },
  new: { label: "New students", format: "int", noun: "new students" },
  reactivated: { label: "Reactivated students", format: "int", noun: "reactivated students" },
  churned: { label: "Churned students", format: "int", noun: "churned students" },
  churnRate: { label: "Churn rate", format: "pct", noun: "churn rate" },
  retentionL12m: { label: "Retention (12-mo avg)", format: "pct", noun: "12-month retention" },
  revenue: { label: "Monthly revenue", format: "money", noun: "monthly revenue" },
  ltv: { label: "Lifetime value", format: "money", noun: "lifetime value per student" },
  growth12: { label: "Student growth since Oct 25", format: "pct", noun: "student growth since Oct 2025", only: ["schools"] },
  churned12: { label: "Churned, last 12 months", format: "int", noun: "students churned over 12 months", only: ["schools"] },
  winBack12: { label: "Win-back ratio, 12 months", format: "pct0", noun: "12-month win-back ratio", only: ["schools"] },
};
const DIMS = { schools: "School", groups: "Ownership group", regions: "Region" };
const REGIONS = ["Northeast", "Midwest & CA", "Southeast", "West"];

const PRESETS = [
  { q: "Which schools lost the most students last month?", s: { dim: "schools", metric: "churned", dir: "desc" } },
  { q: "Which schools have the highest churn rate?", s: { dim: "schools", metric: "churnRate", dir: "desc" } },
  { q: "Which ownership groups retain students best?", s: { dim: "groups", metric: "retentionL12m", dir: "desc" } },
  { q: "Which schools grew the most this year?", s: { dim: "schools", metric: "growth12", dir: "desc" } },
  { q: "Which schools win back the most lost students?", s: { dim: "schools", metric: "winBack12", dir: "desc" } },
  { q: "How do regions compare on retention?", s: { dim: "regions", metric: "retentionL12m", dir: "desc" } },
  { q: "Which Northeast schools bring in the most revenue?", s: { dim: "schools", metric: "revenue", dir: "desc", region: "Northeast" } },
  { q: "Which ownership groups have the weakest retention?", s: { dim: "groups", metric: "retentionL12m", dir: "asc" } },
];

// Keyword matching: turns a typed question into explorer settings.
function interpret(text) {
  const t = text.toLowerCase();
  const s = { dim: "schools", metric: "students", dir: "desc", region: "", n: 10 };
  if (/group|owner|franchis|operator/.test(t)) s.dim = "groups";
  else if (/region/.test(t) && !REGIONS.some((r) => t.includes(r.toLowerCase().split(" ")[0]))) s.dim = "regions";

  if (/win.?back|come back|came back|return/.test(t)) s.metric = s.dim === "schools" ? "winBack12" : "reactivated";
  else if (/reactivat/.test(t)) s.metric = "reactivated";
  else if (/churn rate|drop rate|cancel.*rate|rate of/.test(t)) s.metric = "churnRate";
  else if (/retain|retention|keep/.test(t)) s.metric = "retentionL12m";
  else if (/lifetime|ltv/.test(t)) s.metric = "ltv";
  else if (/revenue|sales|money|tuition|\$/.test(t)) s.metric = "revenue";
  else if (/grow|growth|grew|gain/.test(t)) s.metric = s.dim === "schools" ? "growth12" : "new";
  else if (/new (student|enrol)|enroll|sign.?up/.test(t)) s.metric = "new";
  else if (/churn|lost|lose|drop|cancel|leav/.test(t)) s.metric = /year|12/.test(t) && s.dim === "schools" ? "churned12" : "churned";

  const lowWords = /lowest|least|fewest|worst|weakest|smallest|bottom|struggl/;
  const highWords = /highest|most|best|strongest|largest|biggest|top/;
  if (lowWords.test(t)) s.dir = "asc";
  if (highWords.test(t)) s.dir = "desc";
  // "worst churn rate" means highest churn
  if (/worst|struggl/.test(t) && ["churnRate", "churned", "churned12"].includes(s.metric)) s.dir = "desc";
  if (/best/.test(t) && ["churnRate", "churned"].includes(s.metric)) s.dir = "asc";

  const reg = REGIONS.find((r) => t.includes(r.toLowerCase().split(" ")[0]));
  if (reg && s.dim === "schools") s.region = reg;
  const n = t.match(/\btop (\d+)|\b(\d+) (schools|groups)/);
  if (n) s.n = Math.min(50, Number(n[1] || n[2]));
  return s;
}

export default function Explorer({ data, asOfLabel }) {
  const [state, setState] = useState({ dim: "schools", metric: "churned", dir: "desc", region: "", n: 10 });
  const [text, setText] = useState("");
  const [asked, setAsked] = useState(PRESETS[0].q);

  const set = (patch) => setState((s) => {
    const next = { ...s, ...patch };
    if (METRICS[next.metric].only && !METRICS[next.metric].only.includes(next.dim)) next.metric = "students";
    if (next.dim !== "schools") next.region = "";
    return next;
  });

  const ask = (q, s) => {
    setAsked(q);
    setState({ region: "", n: 10, ...s });
  };

  const rows = useMemo(() => {
    const m = state.metric;
    return data[state.dim]
      .filter((r) => !state.region || r.region === state.region)
      .filter((r) => r[m] != null && (state.dim !== "schools" || !["churnRate", "growth12", "winBack12"].includes(m) || r.beginning >= 100))
      .sort((a, b) => (state.dir === "asc" ? a[m] - b[m] : b[m] - a[m]));
  }, [data, state]);

  const shown = rows.slice(0, state.n);
  const meta = METRICS[state.metric];
  const fmt = FMT[meta.format];
  const max = Math.max(...shown.map((r) => Math.abs(r[state.metric])), 0);
  const top = shown[0];
  const where = state.region ? ` in the ${state.region}` : "";
  const dimNoun = { schools: "school", groups: "ownership group", regions: "region" }[state.dim];

  const answer = top
    ? `${meta.format === "int" ? (state.dir === "desc" ? "Most" : "Fewest") : state.dir === "desc" ? "Highest" : "Lowest"} ${meta.noun}${where}: ${top.name}, ${fmt(top[state.metric])}.`
    : "No results for that combination.";

  const allowedMetrics = Object.entries(METRICS).filter(([, v]) => !v.only || v.only.includes(state.dim));
  // Rates on a narrow range look better scaled from the smallest shown value.
  const isRate = ["pct", "pct0"].includes(meta.format);
  const lo = isRate && state.metric !== "growth12" ? Math.max(0, Math.min(...shown.map((r) => r[state.metric])) * 0.9) : 0;
  const width = (v) => (max - lo > 0 ? Math.max(2, ((Math.abs(v) - lo) / (max - lo)) * 100) : 0);

  return (
    <>
      <form
        className="controls"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          setAsked(text.trim());
          setState(interpret(text));
        }}
      >
        <input type="search" value={text} onChange={(e) => setText(e.target.value)} style={{ flex: 1, minWidth: 260 }}
          placeholder="Ask a question, e.g. “which West schools have the highest churn rate?”" aria-label="Ask a question" />
        <button className="btn" type="submit">Ask</button>
      </form>

      <div className="chips">
        {PRESETS.map((p) => (
          <button key={p.q} className={`chip ${asked === p.q ? "on" : ""}`} onClick={() => { setText(""); ask(p.q, p.s); }}>
            {p.q}
          </button>
        ))}
      </div>

      <div className="card">
        <div style={{ fontSize: 13, color: "var(--text-3)" }}>“{asked}”</div>
        <h2 style={{ fontSize: 18, margin: "4px 0 14px" }}>{answer}</h2>

        <div className="controls">
          <label>Show
            <select value={state.metric} onChange={(e) => set({ metric: e.target.value })}>
              {allowedMetrics.map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </label>
          <label>by
            <select value={state.dim} onChange={(e) => set({ dim: e.target.value })}>
              {Object.entries(DIMS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          {state.dim === "schools" && (
            <label>in
              <select value={state.region} onChange={(e) => set({ region: e.target.value })}>
                <option value="">All regions</option>
                {REGIONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </label>
          )}
          <label>
            <select value={state.dir} onChange={(e) => set({ dir: e.target.value })}>
              <option value="desc">Highest first</option>
              <option value="asc">Lowest first</option>
            </select>
          </label>
          {state.dim !== "regions" && (
            <label>
              <select value={state.n} onChange={(e) => set({ n: Number(e.target.value) })}>
                {[10, 25, 50].map((n) => <option key={n} value={n}>Top {n}</option>)}
              </select>
            </label>
          )}
        </div>

        <div className="barlist" role="table" aria-label={`${meta.label} by ${dimNoun}`}>
          {shown.map((r) => (
            <div className="barrow" role="row" key={r.name}>
              <span className="name" role="cell" title={r.name}>
                {r.slug ? <Link href={`/schools/${r.slug}`}>{r.name}</Link> : r.name}
              </span>
              <span className="track" role="cell"><span className="fill" style={{ display: "block", width: `${width(r[state.metric])}%`, background: r[state.metric] < 0 ? "var(--loss)" : "var(--accent)" }} /></span>
              <span className="v num" role="cell">{fmt(r[state.metric])}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12.5, color: "var(--text-3)", margin: "14px 0 0" }}>
          {rows.length} {dimNoun}{rows.length === 1 ? "" : "s"} · {asOfLabel} snapshot
          {state.dim === "schools" && ["churnRate", "growth12", "winBack12"].includes(state.metric) ? " · schools under 100 students left out of rate rankings" : ""}
          {isRate && state.metric !== "growth12" ? " · bars start near the lowest value shown so differences are visible" : ""}
        </p>
      </div>
    </>
  );
}
