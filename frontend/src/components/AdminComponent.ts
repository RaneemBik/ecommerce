import { icons } from '../icons';
import { navigate } from '../router';
import { siteName } from '../siteConfig';
import { logout } from '../services/api';
import { listOrders, listProducts } from '../services/adminApi';

export function renderAdmin(root: HTMLElement): void {
  const user = JSON.parse(localStorage.getItem('novadash_user') || '{}');
  const initials = (user.name || 'Admin User')
    .split(' ')
    .map((word: string) => word[0])
    .join('')
    .toUpperCase();

  root.innerHTML = `
    <div class="admin-layout">
      <div class="sidebar-overlay" id="sidebarOverlay"></div>

      <aside class="sidebar" id="sidebar">
        <div class="sidebar__header">
          <div class="sidebar__logo">N</div>
          <span class="sidebar__brand" data-site-name>${siteName}</span>
        </div>

        <nav class="sidebar__nav" role="navigation" aria-label="Main navigation">
          <div class="sidebar__section">
            <div class="sidebar__section-title">Main</div>
            <button class="sidebar__link active" data-page="dashboard">${icons.dashboard} Dashboard</button>
            <button class="sidebar__link" data-page="users">${icons.users} Users</button>
            <button class="sidebar__link" data-page="products">${icons.products} Products <span class="sidebar__link-badge" id="productsBadge">0</span></button>
            <button class="sidebar__link" data-page="orders">${icons.orders} Orders <span class="sidebar__link-badge" id="ordersBadge">0</span></button>
            <button class="sidebar__link" data-page="messages">${icons.messages} Messages</button>
          </div>
        </nav>

        <div class="sidebar__footer" role="contentinfo">
          <div class="sidebar__user">
            <div class="sidebar__avatar">${initials}</div>
            <div class="sidebar__user-info">
              <div class="sidebar__user-name">${user.name || 'Admin User'}</div>
              <div class="sidebar__user-role">${user.role || 'Administrator'}</div>
            </div>
            <button class="sidebar__logout" id="logoutBtn" title="Sign out">${icons.logout}</button>
          </div>
        </div>
      </aside>

      <div class="main-area">
        <header class="topbar" role="banner">
          <button class="topbar__burger" id="burgerBtn">${icons.burger}</button>
          <div style="font-weight:600">Admin</div>
          <div class="topbar__actions">
            <button class="topbar__action" id="themeToggle" title="Toggle theme">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            </button>
          </div>
        </header>

        <main class="page-content" id="pageContent"></main>
      </div>
    </div>
  `;

  bindAdminEvents();
  void renderAdminInnerPage();
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('novadash_theme', next);
}

async function renderAdminInnerPage() {
  const container = document.getElementById('pageContent');
  if (!container) return;

  const path = location.pathname || '/admin';
  const parts = path.split('/').filter(Boolean);
  const page = parts[1] || 'dashboard';

  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    const links = sidebar.querySelectorAll<HTMLButtonElement>('.sidebar__link');
    links.forEach((link) => link.classList.toggle('active', link.dataset.page === page));
  }

  try {
    switch (page) {
      case 'users': {
        const mod = await import('./pages/UsersPage');
        mod.renderUsers(container);
        break;
      }
      case 'products': {
        const mod = await import('./pages/ProductsPage');
        mod.renderProducts(container);
        break;
      }
      case 'orders': {
        const mod = await import('./pages/OrdersPage');
        mod.renderOrders(container);
        break;
      }
      case 'messages': {
        const mod = await import('./pages/MessagesPage');
        mod.renderMessages(container);
        break;
      }
      default: {
        const mod = await import('./pages/DashboardPage');
        mod.renderDashboard(container);
        break;
      }
    }
  } catch (error) {
    container.innerHTML = '<div class="panel">Failed to load page.</div>';
    console.error('Failed to render admin page', error);
  }
}

async function updateBadges() {
  try {
    const [productsResult, ordersResult] = await Promise.all([
      listProducts({ page: 1, limit: 1 }),
      listOrders({ page: 1, limit: 1 }),
    ]);

    const productsBadge = document.getElementById('productsBadge');
    const ordersBadge = document.getElementById('ordersBadge');

    if (productsBadge) productsBadge.textContent = String(productsResult.total || 0);
    if (ordersBadge) ordersBadge.textContent = String(ordersResult.total || 0);
  } catch {
    return;
  }
}

function bindAdminEvents() {
  const sidebar = document.getElementById('sidebar') as HTMLElement;
  const overlay = document.getElementById('sidebarOverlay') as HTMLElement;
  const burger = document.getElementById('burgerBtn') as HTMLButtonElement;
  const logoutBtn = document.getElementById('logoutBtn') as HTMLButtonElement;
  const themeToggle = document.getElementById('themeToggle') as HTMLButtonElement;

  burger.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar--open');
    overlay.classList.toggle('visible');
  });

  overlay.addEventListener('click', () => {
    sidebar.classList.remove('sidebar--open');
    overlay.classList.remove('visible');
  });

  sidebar.querySelectorAll<HTMLButtonElement>('.sidebar__link').forEach((link) => {
    link.addEventListener('click', () => {
      const page = link.dataset.page || 'dashboard';
      navigate(`/admin/${page === 'dashboard' ? '' : page}`);
      sidebar.classList.remove('sidebar--open');
      overlay.classList.remove('visible');
    });
  });

  logoutBtn.addEventListener('click', () => {
    logout();
    navigate('/');
  });

  themeToggle.addEventListener('click', toggleTheme);

  window.addEventListener('novadash:data-changed', () => {
    void updateBadges();
  });

  void updateBadges();
}
