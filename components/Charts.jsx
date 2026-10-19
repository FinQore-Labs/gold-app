"use client";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from "recharts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const mLabel = (m) => {
  const [y, mo] = m.split("-").map(Number);
  return `${MONTHS[mo - 1]} ${String(y).slice(2)}`;
};
const FORMATS = {
  int: (n) => (n == null ? "—" : Math.round(n).toLocaleString("en-US")),
  pct: (n) => (n == null ? "—" : `${(n * 100).toFixed(1)}%`),
  money: (n) => (n == null ? "—" : `$${Math.round(n).toLocaleString("en-US")}`),
};
const AXIS = {
  int: (n) => (Math.abs(n) >= 10000 ? `${Math.round(n / 1000)}k` : Math.round(n).toLocaleString("en-US")),
  pct: (n) => `${(n * 100).toFixed(0)}%`,
  money: (n) => (Math.abs(n) >= 1e6 ? `$${(n / 1e6).toFixed(0)}M` : Math.abs(n) >= 1e3 ? `$${Math.round(n / 1e3)}k` : `$${n}`),
};

const axisProps = {
  tick: { fill: "var(--text-3)", fontSize: 12 },
  tickLine: false,
  axisLine: false,
};

function Tip({ active, payload, label, series, format }) {
  if (!active || !payload?.length) return null;
  const f = FORMATS[format];
  return (
    <div className="chart-tip">
      <div className="t">{mLabel(label)}</div>
      {series.map((s) => {
        const p = payload.find((x) => x.dataKey === s.key);
        if (!p) return null;
        return (
          <div className="r" key={s.key}>
            <span><i style={{ background: s.color }} />{s.label}</span>
            <b className="num">{f(s.abs ? Math.abs(p.value) : p.value)}</b>
          </div>
        );
      })}
    </div>
  );
}

function Legend({ series }) {
  if (series.length < 2) return null;
  return (
    <div className="legend">
      {series.map((s) => (
        <span key={s.key}><i style={{ background: s.color }} />{s.label}</span>
      ))}
    </div>
  );
}

// series: [{key, label, color}]
export function TrendChart({ data, series, format = "int", height = 260, domain }) {
  return (
    <div>
      <Legend series={series} />
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--grid)" />
          <XAxis dataKey="month" tickFormatter={mLabel} {...axisProps} minTickGap={20} />
          <YAxis tickFormatter={AXIS[format]} {...axisProps} width={48} domain={domain || ["auto", "auto"]} />
          <Tooltip content={<Tip series={series} format={format} />} cursor={{ stroke: "var(--text-3)", strokeDasharray: "3 3" }} />
          {series.map((s) => (
            <Line key={s.key} dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} dot={false}
              activeDot={{ r: 5, stroke: "var(--surface)", strokeWidth: 2 }} isAnimationActive={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Gains stacked above zero, churn below zero.
export function MovementChart({ data, height = 280 }) {
  const rows = data.map((d) => ({ month: d.month, new: d.new, reactivated: d.reactivated, churned: -d.churned }));
  const series = [
    { key: "new", label: "New students", color: "var(--gain)" },
    { key: "reactivated", label: "Reactivated", color: "var(--gain-2)" },
    { key: "churned", label: "Churned", color: "var(--loss)", abs: true },
  ];
  return (
    <div>
      <Legend series={series} />
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={rows} stackOffset="sign" margin={{ top: 8, right: 12, bottom: 0, left: 0 }} barCategoryGap="22%">
          <CartesianGrid vertical={false} stroke="var(--grid)" />
          <XAxis dataKey="month" tickFormatter={mLabel} {...axisProps} minTickGap={16} />
          <YAxis tickFormatter={(n) => AXIS.int(Math.abs(n))} {...axisProps} width={48} />
          <ReferenceLine y={0} stroke="var(--text-3)" />
          <Tooltip content={<Tip series={series} format="int" />} cursor={{ fill: "var(--surface-2)" }} />
          <Bar dataKey="new" stackId="a" fill="var(--gain)" stroke="var(--surface)" strokeWidth={1} isAnimationActive={false} />
          <Bar dataKey="reactivated" stackId="a" fill="var(--gain-2)" stroke="var(--surface)" strokeWidth={1} radius={[4, 4, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="churned" stackId="a" fill="var(--loss)" radius={[0, 0, 4, 4]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
