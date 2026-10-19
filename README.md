# GOLD Insights

A dashboard for the GOLD Goldfish Swim School network, built from FinQore data. It has five pages:

- **Overview**: network students, revenue, new / reactivated / churned students, retention, and a region breakdown.
- **Churn & reactivation**: churn rate over time and by region, win-back ratio, and the schools with the highest churn.
- **Schools**: all schools, with search, filters, sorting and CSV download. Each school has its own page with a 12-month history.
- **Ownership groups**: every franchise ownership group side by side.
- **Ask your data**: type a question or pick one to rank schools, groups or regions on any metric.

## Where the data comes from

The numbers live in `data/gold.json`, a snapshot pulled from FinQore (GOLD, production) through Claude's FinQore connector. No API keys are involved. The current snapshot covers months through **September 2026**, which is the latest closed month. Network totals were spot-checked against the FinQore MotherDuck mirror.

The app shows totals only. Student names and contact details are not included.

### Refreshing the data

Ask Claude something like *"Refresh the GOLD Insights app with the latest FinQore data and push it."* Claude re-pulls the numbers, rewrites `data/gold.json` and pushes the change. Vercel then redeploys on its own. A scheduled task can do this automatically each month.

## Deploying on Vercel

1. Go to vercel.com → **Add New → Project** and import this GitHub repo. The default settings work as they are.
2. In **Settings → Environment Variables**, add `APP_PASSWORD` with a password of your choosing, then redeploy. Visitors will be asked for it; any username works. Without it, the site is open to anyone with the link.
3. Every push to `main` redeploys the site.

## Running locally

```bash
npm install
npm run dev   # http://localhost:3000
```

Built with Next.js and Recharts.
