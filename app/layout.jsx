import "./globals.css";
import Nav from "../components/Nav";
import { meta, monthLabel } from "../lib/data";

export const metadata = {
  title: "GOLD Insights",
  description: "Goldfish Swim School network insights from FinQore",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <div className="topbar-inner">
            <a href="/" className="brand">
              <span className="brand-mark">G</span>
              <span>
                GOLD Insights
                <small>Goldfish Swim School network</small>
              </span>
            </a>
            <Nav />
            <span className="asof">
              Data through {monthLabel(meta.asOf, true)} · refreshed {meta.pulledAt}
            </span>
          </div>
        </header>
        <main>{children}</main>
        <footer>
          Source: {meta.source}. Notes:
          <ul>
            {meta.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </footer>
      </body>
    </html>
  );
}
