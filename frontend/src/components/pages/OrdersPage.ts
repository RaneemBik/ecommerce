import {
  createOrder,
  deleteOrder,
  listOrders,
  listProducts,
  listUsers,
  updateOrder,
  type Customer,
  type Order,
  type OrderPriority,
  type OrderStatus,
  type Product,
} from '../../services/adminApi';
import { confirmModal, showToast } from '../../ui/modal';

type OrderQuery = {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search: string;
  status: '' | OrderStatus;
  priority: '' | OrderPriority;
  from: string;
  to: string;
};

const initialQuery: OrderQuery = {
  page: 1,
  limit: 10,
  sort: 'createdAt',
  order: 'desc',
  search: '',
  status: '',
  priority: '',
  from: '',
  to: '',
};

function formatDate(value?: string) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString();
}

function customerName(order: Order) {
  if (typeof order.customerId === 'string') return order.customerId;
  return order.customerId?.name || '-';
}

function productName(product: Product | string) {
  if (typeof product === 'string') return product;
  return product.name;
}

export function renderOrders(container: HTMLElement) {
  let query: OrderQuery = { ...initialQuery };

  async function loadData() {
    container.innerHTML = `<h1 class="page-title">Orders</h1><p class="page-subtitle">Manage orders with real backend data.</p><div class="panel">Loading orders...</div>`;
    try {
      const [ordersResult, usersResult, productsResult] = await Promise.all([
        listOrders(query),
        listUsers({ page: 1, limit: 100, sort: 'name', order: 'asc' }),
        listProducts({ page: 1, limit: 100, sort: 'name', order: 'asc' }),
      ]);
      render(ordersResult.items, ordersResult.total, ordersResult.page, ordersResult.pages, usersResult.items, productsResult.items);
    } catch (error: any) {
      container.innerHTML = `<h1 class="page-title">Orders</h1><p class="page-subtitle">Manage orders with real backend data.</p><div class="panel">Error: ${error.message || 'Failed to load orders'}</div>`;
    }
  }

  function render(items: Order[], total: number, page: number, pages: number, users: Customer[], products: Product[]) {
    container.innerHTML = `
      <h1 class="page-title">Orders</h1>
      <p class="page-subtitle">Manage orders with real backend data.</p>

      <div class="panel" style="margin-bottom:12px">
        <div class="panel__header"><h3 class="panel__title">Filters</h3></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px">
          <input id="qSearch" class="form-input" placeholder="Search by customer name/email" value="${query.search}" />
          <select id="qStatus" class="form-input">
            <option value="" ${query.status === '' ? 'selected' : ''}>Status: All</option>
            <option value="pending" ${query.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="paid" ${query.status === 'paid' ? 'selected' : ''}>Paid</option>
            <option value="shipped" ${query.status === 'shipped' ? 'selected' : ''}>Shipped</option>
            <option value="delivered" ${query.status === 'delivered' ? 'selected' : ''}>Delivered</option>
            <option value="cancelled" ${query.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
          <select id="qPriority" class="form-input">
            <option value="" ${query.priority === '' ? 'selected' : ''}>Priority: All</option>
            <option value="low" ${query.priority === 'low' ? 'selected' : ''}>Low</option>
            <option value="medium" ${query.priority === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="high" ${query.priority === 'high' ? 'selected' : ''}>High</option>
          </select>
          <input id="qFrom" class="form-input" type="date" value="${query.from}" />
          <input id="qTo" class="form-input" type="date" value="${query.to}" />
          <select id="qSort" class="form-input">
            <option value="createdAt" ${query.sort === 'createdAt' ? 'selected' : ''}>Sort: Created At</option>
            <option value="updatedAt" ${query.sort === 'updatedAt' ? 'selected' : ''}>Sort: Updated At</option>
            <option value="total" ${query.sort === 'total' ? 'selected' : ''}>Sort: Total</option>
            <option value="status" ${query.sort === 'status' ? 'selected' : ''}>Sort: Status</option>
            <option value="priority" ${query.sort === 'priority' ? 'selected' : ''}>Sort: Priority</option>
          </select>
          <select id="qOrder" class="form-input">
            <option value="desc" ${query.order === 'desc' ? 'selected' : ''}>Order: Desc</option>
            <option value="asc" ${query.order === 'asc' ? 'selected' : ''}>Order: Asc</option>
          </select>
          <select id="qLimit" class="form-input">
            <option value="10" ${query.limit === 10 ? 'selected' : ''}>10 / page</option>
            <option value="20" ${query.limit === 20 ? 'selected' : ''}>20 / page</option>
            <option value="50" ${query.limit === 50 ? 'selected' : ''}>50 / page</option>
          </select>
          <button id="applyFilters" class="btn btn--primary">Apply</button>
        </div>
      </div>

      <div class="panel" style="margin-bottom:12px">
        <div class="panel__header"><h3 class="panel__title">Create Order</h3></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px">
          <select id="fCustomer" class="form-input">
            <option value="">Select customer</option>
            ${users.map((user) => `<option value="${user._id}">${user.name} (${user.email})</option>`).join('')}
          </select>
          <select id="fProduct" class="form-input">
            <option value="">Select product</option>
            ${products.map((product) => `<option value="${product._id}">${product.name} (${product.sku})</option>`).join('')}
          </select>
          <input id="fQty" class="form-input" type="number" min="1" value="1" placeholder="Quantity" />
          <select id="fPriority" class="form-input">
            <option value="medium">Priority: Medium</option>
            <option value="low">Priority: Low</option>
            <option value="high">Priority: High</option>
          </select>
          <button id="createOrder" class="btn btn--primary">Create</button>
        </div>
      </div>

      <div class="panel">
        <div class="panel__header"><h3 class="panel__title">Orders (${total})</h3></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Priority</th><th>Created At</th><th>Updated At</th><th>Actions</th></tr>
            </thead>
            <tbody>
              ${items.length === 0 ? `<tr><td colspan="8">No results found</td></tr>` : items.map((order) => `
                <tr>
                  <td>${customerName(order)}</td>
                  <td>${order.items.map((item) => `${productName(item.productId)} x${item.quantity}`).join(', ')}</td>
                  <td>$${order.total.toFixed(2)}</td>
                  <td>
                    <select class="form-input order-status" data-id="${order._id}">
                      <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                      <option value="paid" ${order.status === 'paid' ? 'selected' : ''}>Paid</option>
                      <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                      <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                      <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <select class="form-input order-priority" data-id="${order._id}">
                      <option value="low" ${order.priority === 'low' ? 'selected' : ''}>Low</option>
                      <option value="medium" ${order.priority === 'medium' ? 'selected' : ''}>Medium</option>
                      <option value="high" ${order.priority === 'high' ? 'selected' : ''}>High</option>
                    </select>
                  </td>
                  <td>${formatDate(order.createdAt)}</td>
                  <td>${formatDate(order.updatedAt)}</td>
                  <td style="display:flex;gap:8px;flex-wrap:wrap">
                    <button class="btn btn--danger btn--small delete-order" data-id="${order._id}">Delete</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
          <button id="prevPage" class="btn btn--secondary" ${page <= 1 ? 'disabled' : ''}>Previous</button>
          <span>Page ${page} of ${pages || 1}</span>
          <button id="nextPage" class="btn btn--secondary" ${pages > 0 && page >= pages ? 'disabled' : ''}>Next</button>
        </div>
      </div>
    `;

    const qSearch = document.getElementById('qSearch') as HTMLInputElement;
    const qStatus = document.getElementById('qStatus') as HTMLSelectElement;
    const qPriority = document.getElementById('qPriority') as HTMLSelectElement;
    const qFrom = document.getElementById('qFrom') as HTMLInputElement;
    const qTo = document.getElementById('qTo') as HTMLInputElement;
    const qSort = document.getElementById('qSort') as HTMLSelectElement;
    const qOrder = document.getElementById('qOrder') as HTMLSelectElement;
    const qLimit = document.getElementById('qLimit') as HTMLSelectElement;

    (document.getElementById('applyFilters') as HTMLButtonElement).addEventListener('click', () => {
      query = {
        ...query,
        page: 1,
        search: qSearch.value.trim(),
        status: qStatus.value as '' | OrderStatus,
        priority: qPriority.value as '' | OrderPriority,
        from: qFrom.value,
        to: qTo.value,
        sort: qSort.value,
        order: qOrder.value as 'asc' | 'desc',
        limit: Number(qLimit.value),
      };
      void loadData();
    });

    const fCustomer = document.getElementById('fCustomer') as HTMLSelectElement;
    const fProduct = document.getElementById('fProduct') as HTMLSelectElement;
    const fQty = document.getElementById('fQty') as HTMLInputElement;
    const fPriority = document.getElementById('fPriority') as HTMLSelectElement;

    (document.getElementById('createOrder') as HTMLButtonElement).addEventListener('click', async () => {
      const customerId = fCustomer.value;
      const productId = fProduct.value;
      const quantity = Number(fQty.value);
      const priority = fPriority.value as OrderPriority;

      if (!customerId || !productId || Number.isNaN(quantity) || quantity < 1) {
        showToast('Customer, product and valid quantity are required');
        return;
      }

      try {
        await createOrder({
          customerId,
          priority,
          items: [{ productId, quantity }],
        });
        showToast('Order created');
        window.dispatchEvent(new Event('novadash:data-changed'));
        void loadData();
      } catch (error: any) {
        showToast(error.message || 'Failed to create order');
      }
    });

    container.querySelectorAll<HTMLSelectElement>('.order-status').forEach((select) => {
      select.addEventListener('change', async () => {
        const id = select.dataset.id;
        if (!id) return;
        try {
          await updateOrder(id, { status: select.value as OrderStatus });
          showToast('Order status updated');
          void loadData();
        } catch (error: any) {
          showToast(error.message || 'Failed to update status');
        }
      });
    });

    container.querySelectorAll<HTMLSelectElement>('.order-priority').forEach((select) => {
      select.addEventListener('change', async () => {
        const id = select.dataset.id;
        if (!id) return;
        try {
          await updateOrder(id, { priority: select.value as OrderPriority });
          showToast('Order priority updated');
          void loadData();
        } catch (error: any) {
          showToast(error.message || 'Failed to update priority');
        }
      });
    });

    container.querySelectorAll<HTMLButtonElement>('.delete-order').forEach((button) => {
      button.addEventListener('click', async () => {
        const id = button.dataset.id;
        if (!id) return;
        const ok = await confirmModal('Delete this order?', 'Delete Order');
        if (!ok) return;
        try {
          await deleteOrder(id);
          showToast('Order deleted (soft delete)');
          window.dispatchEvent(new Event('novadash:data-changed'));
          void loadData();
        } catch (error: any) {
          showToast(error.message || 'Failed to delete order');
        }
      });
    });

    (document.getElementById('prevPage') as HTMLButtonElement).addEventListener('click', () => {
      if (query.page > 1) {
        query.page -= 1;
        void loadData();
      }
    });

    (document.getElementById('nextPage') as HTMLButtonElement).addEventListener('click', () => {
      if (!pages || query.page < pages) {
        query.page += 1;
        void loadData();
      }
    });
  }

  void loadData();
}
