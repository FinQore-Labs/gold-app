// Stat tile. `good` says whether a positive change is good news.
export default function Kpi({ label, value, change, changeLabel, good = "up" }) {
  let cls = "";
  if (change != null && change !== 0) {
    const positive = change > 0;
    cls = (good === "up") === positive ? "up" : "down";
  }
  return (
    <div className="card kpi">
      <div className="label">{label}</div>
      <div className="value num">{value}</div>
      {changeLabel && (
        <div className="delta num">
          <span className={cls}>{changeLabel}</span>
        </div>
      )}
    </div>
  );
}
