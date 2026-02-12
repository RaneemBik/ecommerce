/* ─────────────────────────────────────────────────
   NovaDash — Admin Component
   ───────────────────────────────────────────────── */

import { icons } from "../icons";
import { navigate } from "../router";
import { siteName } from "../siteConfig";
// Page renderers are lazy-loaded for performance (dynamic imports)

export function renderAdmin(root: HTMLElement): void {
  const user = JSON.parse(localStorage.getItem("novadash_user") || "{}");
  const initials = (user.name || "A U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  root.innerHTML = /* html */ `
    <div class="admin-layout">
      <!-- Overlay for mobile sidebar -->
      <div class="sidebar-overlay" id="sidebarOverlay"></div>

      <!-- ═══ Sidebar ═══ -->
      <aside class="sidebar" id="sidebar">
        <div class="sidebar__header">
          <div class="sidebar__logo">N</div>
          <span class="sidebar__brand" data-site-name>${siteName}</span>
        </div>

        <nav class="sidebar__nav" role="navigation" aria-label="Main navigation">
          <div class="sidebar__section">
            <div class="sidebar__section-title">Main</div>
            <button class="sidebar__link active" data-page="dashboard">
              ${icons.dashboard} Dashboard
            </button>
            <button class="sidebar__link" data-page="analytics">
              ${icons.analytics} Analytics
            </button>
            <button class="sidebar__link" data-page="users">
              ${icons.users} Users
            </button>
          </div>

          <div class="sidebar__section">
            <div class="sidebar__section-title">Management</div>
            <button class="sidebar__link" data-page="products">
              ${icons.products} Products
              <span class="sidebar__link-badge" id="productsBadge">5</span>
            </button>
            <button class="sidebar__link" data-page="orders">
              ${icons.orders} Orders
              <span class="sidebar__link-badge" id="ordersBadge">3</span>
            </button>
            <button class="sidebar__link" data-page="messages">
              ${icons.messages} Messages
              <span class="sidebar__link-badge" id="messagesBadge">3</span>
            </button>
          </div>

          <div class="sidebar__section">
            <div class="sidebar__section-title">System</div>
            <button class="sidebar__link" data-page="settings">
              ${icons.settings} Settings
            </button>
          </div>
        </nav>

        <div class="sidebar__footer" role="contentinfo">
          <div class="sidebar__user">
            <div class="sidebar__avatar">${initials}</div>
            <div class="sidebar__user-info">
              <div class="sidebar__user-name">${user.name || "Admin User"}</div>
              <div class="sidebar__user-role">${user.role || "Administrator"}</div>
            </div>
            <button class="sidebar__logout" id="logoutBtn" title="Sign out">
              ${icons.logout}
            </button>
          </div>
        </div>
      </aside>

      <!-- ═══ Main Area ═══ -->
      <div class="main-area">
        <!-- Top Bar -->
        <header class="topbar" role="banner">
          <button class="topbar__burger" id="burgerBtn">
            ${icons.burger}
          </button>
          <div class="topbar__search" role="search">
            <span class="topbar__search-icon">${icons.search}</span>
            <input class="topbar__search-input" type="text" placeholder="Search anything…" />
          </div>
          <div class="topbar__actions">
            <div style="position:relative">
              <button class="topbar__icon-btn" id="notifBtn" title="Notifications" aria-expanded="false">
                ${icons.bell}
                <span class="topbar__notif-dot" id="notifDot"></span>
              </button>
              <div class="notif-popover" id="notifPanel" style="display:none" aria-hidden="true"></div>
            </div>
            <button class="topbar__icon-btn" id="themeBtn" title="Toggle theme">
              ${icons.moon}
            </button>
          </div>
        </header>

        <!-- Page Content -->
        <main class="page-content" id="pageContent"></main>
      </div>
    </div>
  `;

  bindAdminEvents();

  // Render the current admin subpage (dashboard, analytics, users, ...)
  renderAdminInnerPage();
}

async function renderAdminInnerPage() {
  const container = document.getElementById("pageContent");
  if (!container) return;
  const path = location.pathname || "/admin";
  const parts = path.split("/").filter(Boolean); // ['admin', 'analytics']
  const page = parts[1] || "dashboard";

  // update active link
  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    const links = sidebar.querySelectorAll<HTMLButtonElement>(".sidebar__link");
    links.forEach((l) => l.classList.toggle("active", l.dataset.page === page));
  }

  // helper to schedule work during idle time
  const rIC = (cb: () => void) => {
    if (typeof (window as any).requestIdleCallback === 'function') {
      (window as any).requestIdleCallback(cb, { timeout: 600 });
    } else {
      setTimeout(cb, 200);
    }
  };

  try {
    switch (page) {
      case "analytics": {
        const mod = await import("./pages/AnalyticsPage");
        mod.renderAnalytics(container);
        break;
      }
      case "users": {
        const mod = await import("./pages/UsersPage");
        mod.renderUsers(container);
        break;
      }
      case "products": {
        const mod = await import("./pages/ProductsPage");
        mod.renderProducts(container);
        break;
      }
      case "orders": {
        const mod = await import("./pages/OrdersPage");
        mod.renderOrders(container);
        break;
      }
      case "messages": {
        const mod = await import("./pages/MessagesPage");
        mod.renderMessages(container);
        break;
      }
      case "settings": {
        const mod = await import("./pages/SettingsPage");
        mod.renderSettings(container);
        break;
      }
      default: {
        const mod = await import("./pages/DashboardPage");
        mod.renderDashboard(container);
        // defer heavy DOM animations like chart build during idle time
        rIC(() => {
          try { buildChart(); } catch (e) { /* ignore */ }
        });
        break;
      }
    }
  } catch (e) {
    // fallback: simple error message
    container.innerHTML = `<div class="panel"><div class="panel__header"><h3 class="panel__title">Error</h3></div><div style="padding:16px">Failed to load page.</div></div>`;
    console.error('Failed to load admin page', e);
  }
}

/* ═══════════════════════════════════════════════
   Dashboard inner content
   ═══════════════════════════════════════════════ */
function renderDashboardContent(): string {
  return /* html */ `
    <h1 class="page-title">Dashboard</h1>
    <p class="page-subtitle">Here's what's happening with your business today.</p>

    <!-- Stat cards -->
    <div class="stats-grid">
      ${statCard("Total Revenue", "$48,290", "+12.5%", "up", "revenue", "purple")}
      ${statCard("Active Users", "2,847", "+8.2%", "up", "users", "teal")}
      ${statCard("New Orders", "384", "-3.1%", "down", "orders", "pink")}
      ${statCard("Conversion", "4.6%", "+1.8%", "up", "analytics", "amber")}
    </div>

    <!-- Two-column panels -->
    <div class="dashboard-grid">
      <!-- Chart panel -->
      <div class="panel">
        <div class="panel__header">
          <h3 class="panel__title">Revenue Overview</h3>
          <button class="panel__action">View Report</button>
        </div>
        <div class="mini-chart" id="revenueChart"></div>
        <div class="mini-chart__labels" id="chartLabels"></div>
      </div>

      <!-- Progress ring -->
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
            <div class="progress-ring__value">78%</div>
          </div>
          <span class="progress-ring__label">$37,680 of $48,000 goal</span>
        </div>
      </div>

      <!-- Activity feed -->
      <div class="panel">
        <div class="panel__header">
          <h3 class="panel__title">Recent Activity</h3>
          <button class="panel__action">View All</button>
        </div>
        <ul class="activity-list">
          ${activityItem("purple", "<strong>Sarah Chen</strong> placed a new order — <strong>$1,240</strong>", "2 min ago")}
          ${activityItem("teal", "<strong>Mike Ross</strong> completed onboarding", "18 min ago")}
          ${activityItem("pink", "New product <strong>AeroWidget Pro</strong> published", "1 hr ago")}
          ${activityItem("amber", "Server load peaked at <strong>87%</strong> — auto-scaled", "3 hrs ago")}
          ${activityItem("purple", "<strong>Jessica Lee</strong> upgraded to Enterprise plan", "5 hrs ago")}
        </ul>
      </div>

      <!-- Users table -->
      <div class="panel">
        <div class="panel__header">
          <h3 class="panel__title">Top Users</h3>
          <button class="panel__action">All Users</button>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Status</th>
                <th>Spent</th>
              </tr>
            </thead>
            <tbody>
              ${tableRow("Sarah Chen", "SC", "#6c5ce7", "active", "$12,480")}
              ${tableRow("Mike Ross", "MR", "#00cec9", "active", "$9,210")}
              ${tableRow("Emily Park", "EP", "#fd79a8", "pending", "$7,650")}
              ${tableRow("James Liu", "JL", "#fdcb6e", "active", "$6,320")}
              ${tableRow("Anna Kowalski", "AK", "#a29bfe", "inactive", "$4,180")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

/* ─── Helpers ─── */
function statCard(
  label: string, value: string, trend: string,
  dir: "up" | "down", iconKey: string, color: string,
): string {
  const trendIcon = dir === "up" ? icons.trendUp : icons.trendDown;
  return /* html */ `
    <div class="stat-card">
      <div class="stat-card__header">
        <div class="stat-card__icon stat-card__icon--${color}">
          ${(icons as Record<string, string>)[iconKey] || icons.dashboard}
        </div>
        <span class="stat-card__trend stat-card__trend--${dir}">
          ${trendIcon} ${trend}
        </span>
      </div>
      <div class="stat-card__value">${value}</div>
      <div class="stat-card__label">${label}</div>
    </div>
  `;
}

function activityItem(color: string, text: string, time: string): string {
  return /* html */ `
    <li class="activity-item">
      <span class="activity-item__dot activity-item__dot--${color}"></span>
      <div>
        <div class="activity-item__text">${text}</div>
        <div class="activity-item__time">${time}</div>
      </div>
    </li>
  `;
}

function tableRow(
  name: string, initials: string, color: string,
  status: string, spent: string,
): string {
  return /* html */ `
    <tr>
      <td>
        <div class="table-user">
          <div class="table-user__avatar" style="background:${color}">${initials}</div>
          <span class="table-user__name">${name}</span>
        </div>
      </td>
      <td><span class="badge badge--${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
      <td>${spent}</td>
    </tr>
  `;
}

/* ─── Events ─── */
/* ─── Badge Count Updater ─── */
function updateBadges(): void {
  try {
    // Products
    const productsData = localStorage.getItem('novadash_products');
    const products = productsData ? JSON.parse(productsData) : [];
    const productsBadge = document.getElementById('productsBadge');
    if (productsBadge) productsBadge.textContent = String(products.length);

    // Orders
    const ordersData = localStorage.getItem('novadash_orders');
    const orders = ordersData ? JSON.parse(ordersData) : [];
    const ordersBadge = document.getElementById('ordersBadge');
    if (ordersBadge) ordersBadge.textContent = String(orders.length);

    // Messages (unread count)
    const messagesData = localStorage.getItem('novadash_messages');
    const messages = messagesData ? JSON.parse(messagesData) : [];
    const unreadCount = messages.filter((m: any) => !m.read).length;
    const messagesBadge = document.getElementById('messagesBadge');
    if (messagesBadge) messagesBadge.textContent = String(unreadCount);
  } catch (err) {
    console.error('Error updating badges:', err);
  }
}

function bindAdminEvents(): void {
  const sidebar = document.getElementById("sidebar")!;
  const overlay = document.getElementById("sidebarOverlay")!;
  const burger = document.getElementById("burgerBtn")!;
  const logoutBtn = document.getElementById("logoutBtn")!;

  // Mobile toggle
  burger.addEventListener("click", () => {
    sidebar.classList.toggle("sidebar--open");
    overlay.classList.toggle("visible");
  });

  overlay.addEventListener("click", () => {
    sidebar.classList.remove("sidebar--open");
    overlay.classList.remove("visible");
  });

  // Sidebar nav highlight
  const links = sidebar.querySelectorAll<HTMLButtonElement>(".sidebar__link");
  links.forEach((link) => {
    link.addEventListener("click", () => {
      const page = link.dataset.page || "dashboard";
      // Navigate to admin subpage (router will re-render layout and inner page)
      navigate(`/admin/${page === "dashboard" ? "" : page}`);
      // Close mobile sidebar after click
      sidebar.classList.remove("sidebar--open");
      overlay.classList.remove("visible");
    });
  });

  // Keyboard navigation for sidebar (ArrowUp/ArrowDown/Home/End + Enter)
  sidebar.addEventListener('keydown', (ev) => {
    const focusable = Array.from(sidebar.querySelectorAll<HTMLButtonElement>('.sidebar__link'));
    if (!focusable.length) return;
    const idx = focusable.findIndex(f => f === document.activeElement);
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      const next = focusable[(idx + 1) % focusable.length];
      next.focus();
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      const prev = focusable[(idx - 1 + focusable.length) % focusable.length];
      prev.focus();
    } else if (ev.key === 'Home') {
      ev.preventDefault();
      focusable[0].focus();
    } else if (ev.key === 'End') {
      ev.preventDefault();
      focusable[focusable.length - 1].focus();
    } else if (ev.key === 'Enter' && document.activeElement && (document.activeElement as HTMLElement).classList.contains('sidebar__link')) {
      (document.activeElement as HTMLElement).click();
    }
  });

  // Logout
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("novadash_user");
    navigate("/");
  });

  // Notifications
  const notifBtn = document.getElementById("notifBtn");
  const notifPanel = document.getElementById("notifPanel");
  const notifDot = document.getElementById("notifDot");
  let notifications = loadNotifications();

  if (notifPanel) renderNotifPanel(notifPanel, notifications);

  // set initial dot visibility
  if (notifDot) {
    const hasUnread = notifications.some(n => !n.read);
    notifDot.style.display = hasUnread ? 'block' : 'none';
  }

  if (notifBtn) {
    notifBtn.addEventListener("click", (e) => {
      const open = notifPanel && notifPanel.style.display === "block";
      if (notifPanel) {
        notifPanel.style.display = open ? "none" : "block";
        notifPanel.setAttribute("aria-hidden", String(open));
        notifBtn.setAttribute("aria-expanded", String(!open));
      }
      // when opening, mark unread as read and persist
      if (!open) {
        notifications = notifications.map(n => ({ ...n, read: true }));
        saveNotifications(notifications);
        if (notifDot) notifDot.style.display = "none";
        // update panel visuals
        if (notifPanel) renderNotifPanel(notifPanel, notifications);
      }
      e.stopPropagation();
    });
  }

  // close popover when clicking outside
  document.addEventListener('click', (ev) => {
    if (!notifPanel || !notifBtn) return;
    const target = ev.target as Node;
    if (notifPanel.style.display === 'block' && !notifPanel.contains(target) && !notifBtn.contains(target)) {
      notifPanel.style.display = 'none';
      notifPanel.setAttribute('aria-hidden', 'true');
      notifBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Accessibility: close popover on Escape
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      if (notifPanel && notifPanel.style.display === 'block') {
        notifPanel.style.display = 'none';
        notifPanel.setAttribute('aria-hidden', 'true');
        if (notifBtn) notifBtn.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // Theme toggle
  const themeBtn = document.getElementById("themeBtn");
  const currentTheme = localStorage.getItem("novadash_theme") || "dark";
  applyTheme(currentTheme);
  if (currentTheme === "light") {
    // remove notif-dot border contrast for light theme
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const now = (localStorage.getItem("novadash_theme") === "light") ? "dark" : "light";
      localStorage.setItem("novadash_theme", now);
      applyTheme(now);
    });
  }

  // Build mini bar chart
  buildChart();

  // Listen for data changes from pages (orders/messages/products)
  window.addEventListener('novadash:data-changed', () => {
    updateBadges();
  });

  // Update sidebar badge counts from localStorage
  updateBadges();
}

/* ─── Notifications helpers ─── */
function generateNotifications() {
  // simple mock notifications (deprecated, use loadNotifications)
  return [
    { id: 1, title: "New order #1024", body: "$1,240 — Sarah Chen", time: "2m", read: false },
    { id: 2, title: "Server scaled", body: "Autoscaling action completed", time: "18m", read: false },
    { id: 3, title: "New message", body: "You have 3 unread messages", time: "2h", read: false },
  ];
}

function renderNotifPanel(panel: HTMLElement, notifications: Array<any>) {
  panel.innerHTML = `
    <div class="notif-header"><strong>Notifications</strong><button id="markAll" class="panel__action">Mark all</button></div>
    <div class="notif-list">
      ${notifications.map(n => `
        <div class="notif-item" data-id="${n.id}">
          <div class="notif-item__dot" style="background:${n.read ? 'transparent' : 'var(--danger)'}"></div>
          <div>
            <div class="notif-item__text">${n.title} <div style="font-weight:600">${n.body}</div></div>
            <div class="notif-item__time">${n.time}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // attach mark all
  const markAll = panel.querySelector<HTMLButtonElement>('#markAll');
  if (markAll) {
    markAll.addEventListener('click', () => {
      notifications = notifications.map(n => ({ ...n, read: true }));
      saveNotifications(notifications);
      panel.querySelectorAll<HTMLElement>('.notif-item__dot').forEach(d => d.style.background = 'transparent');
      const dot = document.getElementById('notifDot'); if (dot) dot.style.display = 'none';
    });
  }

  // per-item click: mark read and persist
  panel.querySelectorAll<HTMLElement>('.notif-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id ? Number(item.dataset.id) : null;
      if (id == null) return;
      const idx = notifications.findIndex(n => n.id === id);
      if (idx >= 0) {
        notifications[idx].read = true;
        saveNotifications(notifications);
        const dot = item.querySelector<HTMLElement>('.notif-item__dot');
        if (dot) dot.style.background = 'transparent';
        // update global dot if no unread remain
        const globalDot = document.getElementById('notifDot');
        if (globalDot) {
          const hasUnread = notifications.some(n => !n.read);
          globalDot.style.display = hasUnread ? 'block' : 'none';
        }
      }
    });
  });
}

/* Persistence for notifications */
const NOTIF_KEY = 'novadash_notifications';
function loadNotifications(): Array<any> {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  const base = generateNotifications();
  try { localStorage.setItem(NOTIF_KEY, JSON.stringify(base)); } catch (e) {}
  return base;
}

function saveNotifications(arr: Array<any>) {
  try { localStorage.setItem(NOTIF_KEY, JSON.stringify(arr)); } catch (e) {}
}

/* ─── Theme helpers ─── */
function applyTheme(theme: string) {
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.add('theme-light');
  } else {
    root.classList.remove('theme-light');
  }
}

/* ─── CSS-only bar chart ─── */
function buildChart(): void {
  const chart = document.getElementById("revenueChart");
  const labels = document.getElementById("chartLabels");
  if (!chart || !labels) return;

  const data = [
    { label: "Jan", value: 65 },
    { label: "Feb", value: 45 },
    { label: "Mar", value: 78 },
    { label: "Apr", value: 52 },
    { label: "May", value: 90 },
    { label: "Jun", value: 68 },
    { label: "Jul", value: 82 },
    { label: "Aug", value: 95 },
    { label: "Sep", value: 60 },
    { label: "Oct", value: 73 },
    { label: "Nov", value: 88 },
    { label: "Dec", value: 70 },
  ];

  chart.innerHTML = data
    .map(
      (d) =>
        `<div class="mini-chart__bar" style="height:${d.value}%" data-value="${d.value}%"></div>`,
    )
    .join("");

  labels.innerHTML = data
    .map((d) => `<span class="mini-chart__label">${d.label}</span>`)
    .join("");

  // Animate bars in
  requestAnimationFrame(() => {
    chart.querySelectorAll<HTMLElement>(".mini-chart__bar").forEach((bar, i) => {
      bar.style.height = "0%";
      setTimeout(() => {
        bar.style.height = data[i].value + "%";
      }, i * 60);
    });
  });
}
