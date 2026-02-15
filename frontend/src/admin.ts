/* ─────────────────────────────────────────────────
  Nitro — Admin Dashboard Component
   ───────────────────────────────────────────────── */

import { icons } from "./icons";
import { navigate } from "./router";
import { siteName } from "./siteConfig";

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

        <nav class="sidebar__nav">
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
            </button>
            <button class="sidebar__link" data-page="orders">
              ${icons.orders} Orders
              <span class="sidebar__link-badge">12</span>
            </button>
            <button class="sidebar__link" data-page="messages">
              ${icons.messages} Messages
              <span class="sidebar__link-badge">3</span>
            </button>
          </div>

          <div class="sidebar__section">
            <div class="sidebar__section-title">System</div>
            <button class="sidebar__link" data-page="settings">
              ${icons.settings} Settings
            </button>
          </div>
        </nav>

        <div class="sidebar__footer">
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
        <header class="topbar">
          <button class="topbar__burger" id="burgerBtn">
            ${icons.burger}
          </button>
          <div class="topbar__search">
            <span class="topbar__search-icon">${icons.search}</span>
            <input class="topbar__search-input" type="text" placeholder="Search anything…" />
          </div>
          <div class="topbar__actions">
            <button class="topbar__icon-btn" title="Notifications">
              ${icons.bell}
              <span class="topbar__notif-dot"></span>
            </button>
            <button class="topbar__icon-btn" title="Toggle theme">
              ${icons.moon}
            </button>
          </div>
        </header>

        <!-- Page Content -->
        <main class="page-content" id="pageContent">
          ${renderDashboardContent()}
        </main>
      </div>
    </div>
  `;

  bindAdminEvents();
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
      links.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
      // Close mobile sidebar after click
      sidebar.classList.remove("sidebar--open");
      overlay.classList.remove("visible");
    });
  });

  // Logout
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("novadash_user");
    navigate("/");
  });

  // Build mini bar chart
  buildChart();
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
