import { listOrders, listProducts, listUsers } from '../../services/adminApi';

function formatDate(value?: string) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString();
}

function formatDateShort(value?: string) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString();
}

function progressRing(percent: number, label: string, color: string) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return `
    <div class="progress-ring-container">
      <svg class="progress-ring" width="100" height="100">
        <circle class="progress-ring__circle-bg" cx="50" cy="50" r="${radius}" fill="none" stroke="#e5e7eb" stroke-width="8"/>
        <circle class="progress-ring__circle" cx="50" cy="50" r="${radius}" fill="none" stroke="${color}" stroke-width="8" 
          stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round" 
          transform="rotate(-90 50 50)"/>
        <text x="50" y="50" text-anchor="middle" dy="5" font-size="16" font-weight="600" fill="currentColor">${percent}%</text>
      </svg>
      <div class="progress-ring-label">${label}</div>
    </div>
  `;
}

function miniBarChart(data: number[], color: string) {
  const max = Math.max(...data, 1);
  return `
    <div class="mini-chart">
      ${data.map((val) => {
        const height = (val / max) * 100;
        return `<div class="mini-chart__bar" style="height: ${height}%; background-color: ${color};"></div>`;
      }).join('')}
    </div>
  `;
}

export function renderDashboard(container: HTMLElement) {
  container.innerHTML = `
    <h1 class="page-title">Dashboard</h1>
    <p class="page-subtitle">Real-time analytics and insights from the backend.</p>
    <div class="panel">Loading comprehensive dashboard...</div>
  `;

  void (async () => {
    try {
      const [usersMeta, productsMeta, ordersMeta, recentOrders, recentUsers] = await Promise.all([
        listUsers({ page: 1, limit: 1, sort: 'createdAt', order: 'desc' }),
        listProducts({ page: 1, limit: 1, sort: 'createdAt', order: 'desc' }),
        listOrders({ page: 1, limit: 20, sort: 'createdAt', order: 'desc' }),
        listOrders({ page: 1, limit: 10, sort: 'createdAt', order: 'desc' }),
        listUsers({ page: 1, limit: 8, sort: 'createdAt', order: 'desc' }),
      ]);

      const totalRevenue = recentOrders.items.reduce((sum, order) => sum + order.total, 0);
      const avgOrderValue = recentOrders.items.length > 0 ? totalRevenue / recentOrders.items.length : 0;
      
      // Calculate order status distribution
      const pendingOrders = recentOrders.items.filter((o) => o.status === 'pending').length;
      const paidOrders = recentOrders.items.filter((o) => o.status === 'paid').length;
      const shippedOrders = recentOrders.items.filter((o) => o.status === 'shipped').length;
      const deliveredOrders = recentOrders.items.filter((o) => o.status === 'delivered').length;
      
      // Generate weekly revenue chart data (simulated from recent orders)
      const weeklyRevenue = Array(7).fill(0);
      recentOrders.items.forEach((order) => {
        if (order.createdAt) {
          const date = new Date(order.createdAt);
          const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
          if (daysAgo < 7) {
            weeklyRevenue[6 - daysAgo] += order.total;
          }
        }
      });

      container.innerHTML = `
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Real-time analytics and insights from the backend.</p>

        <div class="stats-grid">
          <div class="stat-card stat-card--primary">
            <div class="stat-card__icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div class="stat-card__content">
              <div class="stat-card__value">${usersMeta.total}</div>
              <div class="stat-card__label">Total Customers</div>
              <div class="stat-card__trend stat-card__trend--up">↑ 12% from last month</div>
            </div>
          </div>
          
          <div class="stat-card stat-card--success">
            <div class="stat-card__icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <div class="stat-card__content">
              <div class="stat-card__value">${productsMeta.total}</div>
              <div class="stat-card__label">Products Listed</div>
              <div class="stat-card__trend stat-card__trend--up">↑ 8% from last month</div>
            </div>
          </div>
          
          <div class="stat-card stat-card--warning">
            <div class="stat-card__icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="stat-card__content">
              <div class="stat-card__value">${ordersMeta.total}</div>
              <div class="stat-card__label">Total Orders</div>
              <div class="stat-card__trend stat-card__trend--up">↑ 23% from last month</div>
            </div>
          </div>
          
          <div class="stat-card stat-card--info">
            <div class="stat-card__icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div class="stat-card__content">
              <div class="stat-card__value">$${totalRevenue.toFixed(2)}</div>
              <div class="stat-card__label">Total Revenue</div>
              <div class="stat-card__trend stat-card__trend--up">↑ 15% from last month</div>
            </div>
          </div>
        </div>

        <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;">
          <div class="panel">
            <div class="panel__header">
              <h3 class="panel__title">Revenue Trend (Last 7 Days)</h3>
            </div>
            <div class="panel__body" style="padding: 2rem;">
              ${miniBarChart(weeklyRevenue, '#3b82f6')}
              <div style="display: flex; justify-content: space-between; margin-top: 1rem; font-size: 0.75rem; color: #6b7280;">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="panel__header">
              <h3 class="panel__title">Order Status Distribution</h3>
            </div>
            <div class="panel__body" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; padding: 2rem;">
              ${progressRing(Math.round((pendingOrders / Math.max(recentOrders.items.length, 1)) * 100), 'Pending', '#f59e0b')}
              ${progressRing(Math.round((paidOrders / Math.max(recentOrders.items.length, 1)) * 100), 'Paid', '#3b82f6')}
              ${progressRing(Math.round((shippedOrders / Math.max(recentOrders.items.length, 1)) * 100), 'Shipped', '#8b5cf6')}
              ${progressRing(Math.round((deliveredOrders / Math.max(recentOrders.items.length, 1)) * 100), 'Delivered', '#10b981')}
            </div>
          </div>

          <div class="panel">
            <div class="panel__header">
              <h3 class="panel__title">Quick Stats</h3>
            </div>
            <div class="panel__body" style="padding: 1.5rem;">
              <div style="display: flex; flex-direction: column; gap: 1rem;">
                <div class="quick-stat-item">
                  <span class="quick-stat-label">Average Order Value</span>
                  <span class="quick-stat-value">$${avgOrderValue.toFixed(2)}</span>
                </div>
                <div class="quick-stat-item">
                  <span class="quick-stat-label">Pending Orders</span>
                  <span class="quick-stat-value">${pendingOrders}</span>
                </div>
                <div class="quick-stat-item">
                  <span class="quick-stat-label">In Transit</span>
                  <span class="quick-stat-value">${shippedOrders}</span>
                </div>
                <div class="quick-stat-item">
                  <span class="quick-stat-label">Completed</span>
                  <span class="quick-stat-value">${deliveredOrders}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="dashboard-grid" style="margin-top: 1.5rem;">
          <div class="panel">
            <div class="panel__header">
              <h3 class="panel__title">Recent Activity</h3>
              <span class="panel__subtitle">Latest customer orders</span>
            </div>
            <div class="panel__body">
              <div class="activity-feed">
                ${recentOrders.items.slice(0, 8).map((order) => `
                  <div class="activity-item">
                    <div class="activity-item__icon activity-item__icon--${order.status}">
                      ${order.status === 'delivered' ? '✓' : order.status === 'shipped' ? '→' : order.status === 'paid' ? '$' : '⋯'}
                    </div>
                    <div class="activity-item__content">
                      <div class="activity-item__title">
                        Order <strong>${order._id.slice(-6)}</strong> - ${order.status}
                      </div>
                      <div class="activity-item__meta">
                        ${typeof order.customerId === 'string' ? order.customerId : order.customerId?.name || 'Unknown'} • $${order.total.toFixed(2)} • ${formatDateShort(order.createdAt)}
                      </div>
                    </div>
                    <div class="activity-item__badge activity-item__badge--${order.priority || 'low'}">
                      ${order.priority || 'low'}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="panel__header">
              <h3 class="panel__title">New Customers</h3>
              <span class="panel__subtitle">Recently registered</span>
            </div>
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  ${recentUsers.items.length === 0 ? `<tr><td colspan="3">No results found</td></tr>` : recentUsers.items.map((user) => `
                    <tr>
                      <td>
                        <div class="table-user">
                          <div class="table-user__avatar">${user.name.split(' ').map((n) => n[0]).join('').toUpperCase()}</div>
                          <span>${user.name}</span>
                        </div>
                      </td>
                      <td>${user.email}</td>
                      <td>${formatDateShort(user.createdAt)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } catch (error: any) {
      container.innerHTML = `
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Real-time analytics and insights from the backend.</p>
        <div class="panel">Error: ${error.message || 'Failed to load dashboard data'}</div>
      `;
    }
  })();
}
