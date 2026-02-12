import { generateSeries, SeriesPoint } from "../../mockData";
import { renderLineChart } from "../ui/LineChart";
import { renderPieChart } from "../ui/PieChart";

type Range = '7d' | '30d' | '12m';

/**
 * Download a CSV file created from rows.
 */
function csvDownload(filename: string, rows: string[][]) {
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Render the Analytics page. Keeps DOM wiring, chart rendering and export handlers
 * in one place but splits responsibilities into small helper functions for clarity.
 */
export function renderAnalytics(container: HTMLElement) {
  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between">
      <div>
        <h1 class="page-title">Analytics</h1>
        <p class="page-subtitle">Overview of KPIs and funnels.</p>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <div class="controls">
          <button class="btn-small" data-range="7d">7d</button>
          <button class="btn-small" data-range="30d">30d</button>
          <button class="btn-small" data-range="12m">12m</button>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card"><div class="stat-card__value" id="kpiVisitors">—</div><div class="stat-card__label">Visitors</div></div>
      <div class="stat-card"><div class="stat-card__value" id="kpiBounce">—</div><div class="stat-card__label">Bounce Rate</div></div>
      <div class="stat-card"><div class="stat-card__value" id="kpiSession">—</div><div class="stat-card__label">Avg. Session</div></div>
      <div class="stat-card"><div class="stat-card__value" id="kpiConv">—</div><div class="stat-card__label">Conversion</div></div>
    </div>

    <div class="dashboard-grid">
      <div class="panel">
        <div class="panel__header"><h3 class="panel__title">Traffic Over Time</h3><button id="exportTime" class="panel__action">Export CSV</button></div>
        <div id="lineChart" style="height:240px"></div>
      </div>

      <div class="panel">
        <div class="panel__header"><h3 class="panel__title">Traffic Sources</h3><button id="exportSources" class="panel__action">Export</button></div>
        <div id="pieChart" style="height:240px"></div>
      </div>
    </div>

    <div class="panel">
      <div class="panel__header"><h3 class="panel__title">Funnel Conversion</h3><button class="panel__action">Details</button></div>
      <div id="funnel" style="padding:12px">Placeholder funnel: Home → Sign-up → Purchase</div>
    </div>
  `;

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  let currentRange: Range = '30d';

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  const CHANNELS = ['Organic', 'Paid', 'Referral', 'Social'];

  /** Summarize series into source totals for the pie chart */
  function generateSources(series: SeriesPoint[]) {
    return CHANNELS.map((label, i) => {
      const value = Math.round(series.reduce((sum, p) => sum + (p.value * (0.1 + (i * 0.05))), 0));
      return { label, value };
    });
  }

  /** Refresh KPI values and render charts for the selected range. */
  function refresh(range: Range) {
    const series = generateSeries(range);

    // KPI values (mocked/randomized for demo)
    const visitors = series.reduce((acc, p) => acc + p.value, 0);
    (document.getElementById('kpiVisitors') as HTMLElement).textContent = visitors.toLocaleString();
    (document.getElementById('kpiBounce') as HTMLElement).textContent = Math.round(20 + Math.random() * 30) + '%';
    (document.getElementById('kpiSession') as HTMLElement).textContent = (Math.round(2 + Math.random() * 4 * 10) / 10) + 'm';
    (document.getElementById('kpiConv') as HTMLElement).textContent = (Math.round(1 + Math.random() * 4 * 10) / 10) + '%';

    // Render charts
    const lc = document.getElementById('lineChart') as HTMLElement;
    const pc = document.getElementById('pieChart') as HTMLElement;
    renderLineChart(lc, series);
    renderPieChart(pc, generateSources(series));

    // Export handlers
    const exportTime = document.getElementById('exportTime');
    if (exportTime) {
      exportTime.onclick = () => {
        const rows = [['label', 'value'], ...series.map(r => [r.label, String(r.value)])];
        csvDownload(`analytics-${range}.csv`, rows);
      };
    }

    const exportSources = document.getElementById('exportSources');
    if (exportSources) {
      const srcs = generateSources(series);
      exportSources.onclick = () => {
        const rows = [['source', 'value'], ...srcs.map(r => [r.label, String(r.value)])];
        csvDownload(`sources-${range}.csv`, rows);
      };
    }
  }

  // ---------------------------------------------------------------------------
  // Wiring: range controls with debounce
  // ---------------------------------------------------------------------------
  function debounce<T extends (...args: any[]) => void>(fn: T, wait = 150) {
    let t: number | undefined;
    return (...args: Parameters<T>) => { clearTimeout(t); t = window.setTimeout(() => fn(...args), wait); };
  }

  const debouncedRefresh = debounce((r: Range) => refresh(r), 120);

  document.querySelectorAll('button[data-range]').forEach(btn => {
    btn.addEventListener('click', () => {
      const r = ((btn as HTMLElement).dataset.range as Range) || '30d';
      currentRange = r;
      debouncedRefresh(r);
    });
  });

  // initial render
  refresh(currentRange);
}
