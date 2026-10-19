import raw from "../data/gold.json";

export const meta = raw.meta;
export const network = raw.network;
export const regions = raw.regions;

export const REGIONS = ["Northeast", "Midwest & CA", "Southeast", "West"];

export const slugify = (s) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// Beginning students = ending - new - reactivated + churned
const withRates = (r) => {
  const beginning = r.students - r.new - r.reactivated + r.churned;
  return {
    ...r,
    beginning,
    churnRate: beginning > 0 ? r.churned / beginning : null,
    winBack: r.churned > 0 ? r.reactivated / r.churned : null,
    netChange: r.new + r.reactivated - r.churned,
  };
};

export const networkRows = network.map(withRates);
export const regionRows = regions.map(withRates);
export const groups = raw.groups.map(withRates);

const cols = raw.schoolTrendCols;
export const schoolTrend = Object.fromEntries(
  Object.entries(raw.schoolTrend).map(([school, rows]) => [
    school,
    rows.map((row) => withRates(Object.fromEntries(cols.map((c, i) => [c, row[i]])))),
  ])
);

export const schools = raw.schools.map((s) => {
  const r = withRates(s);
  const trend = schoolTrend[s.school] || [];
  const churned12 = trend.reduce((a, t) => a + t.churned, 0);
  const react12 = trend.reduce((a, t) => a + t.reactivated, 0);
  const new12 = trend.reduce((a, t) => a + t.new, 0);
  const yearAgo = trend[0]?.students ?? null; // Oct 2025
  return {
    ...r,
    slug: slugify(s.school),
    churned12,
    reactivated12: react12,
    new12,
    winBack12: churned12 > 0 ? react12 / churned12 : null,
    growth12: yearAgo ? (s.students - yearAgo) / yearAgo : null,
  };
});

export const groupBySlug = Object.fromEntries(groups.map((g) => [slugify(g.group), g]));
export const schoolBySlug = Object.fromEntries(schools.map((s) => [s.slug, s]));

export const latest = networkRows[networkRows.length - 1];
export const prior = networkRows[networkRows.length - 2];
export const yearAgo = networkRows[networkRows.length - 13];
export const last12 = networkRows.slice(-12);

export const sum = (rows, k) => rows.reduce((a, r) => a + (r[k] || 0), 0);

// ---------- formatting ----------
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const monthLabel = (m, long = false) => {
  const [y, mo] = m.split("-").map(Number);
  return long
    ? new Date(y, mo - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" })
    : `${MONTHS[mo - 1]} ${String(y).slice(2)}`;
};
export const fmtInt = (n) => (n == null ? "—" : Math.round(n).toLocaleString("en-US"));
export const fmtPct = (n, d = 1) => (n == null ? "—" : `${(n * 100).toFixed(d)}%`);
export const fmtMoney = (n, compact = false) => {
  if (n == null) return "—";
  if (compact) {
    if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  }
  return `$${Math.round(n).toLocaleString("en-US")}`;
};
export const fmtSigned = (n) => (n == null ? "—" : `${n > 0 ? "+" : ""}${fmtInt(n)}`);
export const fmtPts = (n) => (n == null ? "—" : `${n > 0 ? "+" : ""}${(n * 100).toFixed(1)} pts`);
