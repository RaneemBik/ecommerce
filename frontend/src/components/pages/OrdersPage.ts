const STORAGE_KEY = 'novadash_orders';

interface Order {
  id: number;
  orderNumber: string;
  user: string;
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'canceled';
  date: string;
}

function loadOrders(): Order[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return getDefaultOrders();
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return getDefaultOrders();
    // normalize entries to expected shape and provide safe defaults
    const normalized = parsed.map((o: any, idx: number) => ({
      id: typeof o.id === 'number' ? o.id : (idx + 1),
      orderNumber: String(o.orderNumber ?? o.order ?? `#${1000 + (o.id || idx + 1)}`),
      user: String(o.user ?? o.customer ?? 'Unknown'),
      total: Number(o.total ?? 0) || 0,
      status: o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered' || o.status === 'canceled' ? o.status : 'pending',
      date: String(o.date ?? new Date().toISOString().split('T')[0])
    } as Order));
    // If normalization changed data shape, persist corrected copy
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized)); } catch (e) {}
    return normalized;
  } catch {
    const defaults = getDefaultOrders();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults)); } catch (e) {}
    return defaults;
  }
}

function saveOrders(orders: Order[]): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(orders)); } catch (e) {}
  // notify app about data change so badges and other views can update
  window.dispatchEvent(new Event('novadash:data-changed'));
}

function getDefaultOrders(): Order[] {
  return [
    { id: 1, orderNumber: '#1024', user: 'Sarah Chen', total: 1240, status: 'paid', date: '2026-02-11' },
    { id: 2, orderNumber: '#1023', user: 'Mike Ross', total: 320, status: 'pending', date: '2026-02-10' },
    { id: 3, orderNumber: '#1022', user: 'Anna Kowalski', total: 89, status: 'canceled', date: '2026-02-09' },
  ];
}

function getStatusBadgeClass(status: Order['status']): string {
  switch (status) {
    case 'paid': return 'badge--active';
    case 'pending': return 'badge--pending';
    case 'shipped': return 'badge--primary';
    case 'delivered': return 'badge--active';
    case 'canceled': return 'badge--inactive';
  }
}

function exportOrdersCSV(orders: Order[]): void {
  const headers = ['Order', 'User', 'Total', 'Status', 'Date'];
  const rows = orders.map(o => [o.orderNumber, o.user, `$${o.total}`, o.status, o.date]);
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// show a modal popup with order details
function showOrderModal(order: Order) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal modal--dark';
  modal.innerHTML = `
    <div class="modal__header">
      <h3>Order ${order.orderNumber}</h3>
      <button class="modal__close" aria-label="Close">&times;</button>
    </div>
    <div class="modal__content">
      <p><strong>User:</strong> ${order.user}</p>
      <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
      <p><strong>Status:</strong> ${order.status}</p>
      <p><strong>Date:</strong> ${order.date}</p>
    </div>
    <div class="modal__actions">
      <button class="btn btn--primary modal-close-btn">OK</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const cleanup = () => { try { document.body.removeChild(overlay); } catch (e) {} };
  overlay.addEventListener('click', (e) => { if (e.target === overlay) cleanup(); });
  modal.querySelector('.modal__close')?.addEventListener('click', cleanup);
  modal.querySelector('.modal-close-btn')?.addEventListener('click', cleanup);
}

export function renderOrders(container: HTMLElement) {
  const orders = loadOrders();

  container.innerHTML = `
    <h1 class="page-title">Orders</h1>
    <p class="page-subtitle">Recent orders and fulfillment status.</p>

    <div class="panel">
      <div class="panel__header">
        <h3 class="panel__title">Recent Orders (${orders.length})</h3>
        <button class="panel__action" id="exportOrdersBtn">Export CSV</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Order</th><th>User</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody id="ordersTableBody">
            ${orders.map(order => `
              <tr data-order-id="${order.id}">
                <td>${order.orderNumber}</td>
                <td>${order.user}</td>
                <td>$${order.total.toFixed(2)}</td>
                <td>
                  <select class="status-select" data-order-id="${order.id}" style="padding: 4px; border-radius: 4px;">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="paid" ${order.status === 'paid' ? 'selected' : ''}>Paid</option>
                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="canceled" ${order.status === 'canceled' ? 'selected' : ''}>Canceled</option>
                  </select>
                </td>
                <td>
                  <div style="display:flex;gap:8px;align-items:center">
                    <button class="btn btn--secondary btn--small view-order-btn" data-order-id="${order.id}">View</button>
                    ${order.status !== 'shipped' && order.status !== 'delivered' && order.status !== 'canceled' ? `
                      <button class="btn btn--primary btn--small ship-order-btn" data-order-id="${order.id}">Ship</button>
                    ` : `
                      <span class="badge ${getStatusBadgeClass(order.status)}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                    `}
                    <button class="btn btn--danger btn--small delete-order-btn" data-order-id="${order.id}" title="Delete order">Delete</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Export button
  const exportBtn = container.querySelector('#exportOrdersBtn');
  exportBtn?.addEventListener('click', () => exportOrdersCSV(orders));

  // Status change
  container.querySelectorAll<HTMLSelectElement>('.status-select').forEach(select => {
    select.addEventListener('change', () => {
      const orderId = Number(select.dataset.orderId);
      const newStatus = select.value as Order['status'];
      const currentOrders = loadOrders();
      const updated = currentOrders.map(o => 
        o.id === orderId ? { ...o, status: newStatus } : o
      );
      saveOrders(updated);
    });
  });

  // View, Ship, Delete buttons
  container.querySelectorAll<HTMLButtonElement>('.view-order-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = Number(btn.dataset.orderId);
      const o = loadOrders().find(x => x.id === orderId);
      if (o) showOrderModal(o);
    });
  });

  container.querySelectorAll<HTMLButtonElement>('.ship-order-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = Number(btn.dataset.orderId);
      const currentOrders = loadOrders();
      const updated = currentOrders.map(o => o.id === orderId ? { ...o, status: 'shipped' as const } : o);
      saveOrders(updated);
      renderOrders(container);
      // show toast
      import('../../ui/modal').then(m => m.showToast('Order marked as shipped'));
    });
  });

  // Delete with modal confirmation and toast
  container.querySelectorAll('.delete-order-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const orderId = Number((btn as HTMLElement).dataset.orderId);
      const { confirmModal, showToast } = await import('../../ui/modal');
      const ok = await confirmModal('Delete this order?', 'Delete Order');
      if (!ok) return;
      const currentOrders = loadOrders();
      const filtered = currentOrders.filter(o => o.id !== orderId);
      saveOrders(filtered);
      renderOrders(container);
      showToast('Order deleted');
    });
  });
}

