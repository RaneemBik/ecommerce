import { icons } from "../../icons";
import { generateSeries, SeriesPoint } from "../../mockData";
import { statCardHTML } from "../ui/StatCard";
import { renderMiniChart } from "../ui/MiniChart";
import { updateProgressRing } from "../ui/ProgressRing";

function renderControls() {
  return `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
      <div style="display:flex;gap:8px">
        <button class="btn-small" data-range="7d">7d</button>
        <button class="btn-small" data-range="30d">30d</button>
        <button class="btn-small" data-range="12m">12m</button>
      </div>
      <div style="margin-left:auto;color:var(--text-muted);font-size:0.95rem">Showing: <span id="rangeLabel">12 months</span></div>
    </div>
  `;
}

export function renderDashboard(container: HTMLElement) {
  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Here's what's happening with your business today.</p>
      </div>
      <div id="controls">${renderControls()}</div>
    </div>

    <div class="stats-grid">
      ${statCardHTML('revenue','Total Revenue','$48,290','+12.5%','up','revenue','purple')}
      ${statCardHTML('users','Active Users','2,847','+8.2%','up','users','teal')}
      ${statCardHTML('orders','New Orders','384','-3.1%','down','orders','pink')}
      ${statCardHTML('conv','Conversion','4.6%','+1.8%','up','analytics','amber')}
    </div>

    <div class="dashboard-grid">
      <div class="panel">
        <div class="panel__header">
          <h3 class="panel__title">Revenue Overview</h3>
          <button class="panel__action" id="downloadReport">Download</button>
        </div>
        <div class="mini-chart" id="revenueChart" aria-hidden="false"></div>
        <div class="mini-chart__labels" id="chartLabels"></div>
      </div>

      <div class="panel">
        <div class="panel__header">
          <h3 class="panel__title">Monthly Target</h3>
          <button class="panel__action">Details</button>
        </div>
        <div class="progress-ring-wrap">
          <div class="progress-ring">
            <svg viewBox="0 0 120 120">
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#6c5ce7"/>
                  <stop offset="100%" stop-color="#00cec9"/>
                </linearGradient>
              </defs>
              <circle class="progress-ring__bg" cx="60" cy="60" r="50"/>
              <circle class="progress-ring__fill" cx="60" cy="60" r="50"/>
            </svg>
            <div class="progress-ring__value" id="progressValue">78%</div>
          </div>
          <span class="progress-ring__label" id="progressLabel">$37,680 of $48,000 goal</span>
        </div>
      </div>

      <div class="panel">
        <div class="panel__header">
          <h3 class="panel__title">Recent Activity</h3>
          <button class="panel__action">View All</button>
        </div>
        <ul class="activity-list" id="activityList"></ul>
      </div>

      <div class="panel">
        <div class="panel__header">
          <h3 class="panel__title">Top Users</h3>
          <button class="panel__action">All Users</button>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr><th>User</th><th>Status</th><th>Spent</th></tr>
            </thead>
            <tbody id="topUsersBody"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // initial state
  let currentRange: '7d'|'30d'|'12m' = '12m';
  const chartEl = document.getElementById('revenueChart')!;
  const labelsEl = document.getElementById('chartLabels')!;

  function updateChart(series: SeriesPoint[]) {
    renderMiniChart(chartEl, labelsEl, series);
  }

  function updateStatsFromSeries(series: SeriesPoint[]) {
    const total = series.reduce((s, p) => s + p.value, 0);
    const revenueEl = document.querySelector('[data-stat-id="revenue"] [data-stat-value]')!;
    revenueEl.textContent = '$' + total.toLocaleString();
    // mock other stats
    const usersEl = document.querySelector('[data-stat-id="users"] [data-stat-value]')!;
    usersEl.textContent = (Math.round(total / 10)).toLocaleString();
    const ordersEl = document.querySelector('[data-stat-id="orders"] [data-stat-value]')!;
    ordersEl.textContent = Math.round(total / 25).toString();
    const convEl = document.querySelector('[data-stat-id="conv"] [data-stat-value]')!;
    convEl.textContent = (Math.max(1, Math.round((total / (series.length*100)) * 10)/10)).toString() + '%';

    // progress ring update
    const goal = 48000;
    const pct = Math.min(100, Math.round((total / goal) * 100));
    updateProgressRing(pct, total, goal);
  }

  function refresh(range: '7d'|'30d'|'12m'){
    const s = generateSeries(range);
    updateChart(s);
    updateStatsFromSeries(s);
    // populate activity and top users with mock items
    const act = document.getElementById('activityList')!;
    act.innerHTML = s.slice(-4).reverse().map(p=>`<li class="activity-item"><span class="activity-item__dot activity-item__dot--purple"></span><div><div class="activity-item__text">Sales tick — <strong>${p.value}</strong></div><div class="activity-item__time">${p.label}</div></div></li>`).join('');
    const usersBody = document.getElementById('topUsersBody')!;
    usersBody.innerHTML = s.slice(0,4).map((p,i)=>`<tr><td><div class="table-user"><div class="table-user__avatar" style="background:var(--accent)">U${i+1}</div><span class="table-user__name">User ${i+1}</span></div></td><td><span class="badge badge--active">Active</span></td><td>$${(p.value*10).toLocaleString()}</td></tr>`).join('');
  }

  // attach controls
  // simple debounce to avoid rapid chart regen
  function debounce<T extends (...args: any[]) => void>(fn: T, wait = 150) {
    let t: any = 0;
    return (...args: Parameters<T>) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  }

  const debouncedRefresh = debounce((r: '7d'|'30d'|'12m') => refresh(r), 150);

  document.querySelectorAll('button[data-range]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const r = (btn as HTMLElement).dataset.range as '7d'|'30d'|'12m';
      currentRange = r;
      document.getElementById('rangeLabel')!.textContent = r === '12m' ? '12 months' : (r === '30d' ? '30 days' : '7 days');
      debouncedRefresh(r);
    });
  });

  // stat cards clickable to filter
  document.querySelectorAll('[data-stat-id]').forEach(el=>{
    el.addEventListener('click', ()=>{
      const id = el.getAttribute('data-stat-id');
      // quick visual feedback
      el.classList.add('active');
      setTimeout(()=>el.classList.remove('active'), 400);
      // regenerate with slight variance
      refresh(currentRange);
    });
  });

  // initial render
  refresh(currentRange);
}
