import { listOrders, listUsers } from '../../services/adminApi';

function formatDate(value?: string) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString();
}

export function renderMessages(container: HTMLElement) {
  container.innerHTML = `
    <h1 class="page-title">Messages</h1>
    <p class="page-subtitle">Simple customer inbox generated from real backend users/orders.</p>
    <div class="panel">Loading messages...</div>
  `;

  void (async () => {
    try {
      const [usersResult, ordersResult] = await Promise.all([
        listUsers({ page: 1, limit: 50, sort: 'updatedAt', order: 'desc' }),
        listOrders({ page: 1, limit: 50, sort: 'updatedAt', order: 'desc' }),
      ]);

      const messages = usersResult.items.slice(0, 20).map((user) => {
        const latestOrder = ordersResult.items.find((order) => {
          if (typeof order.customerId === 'string') return order.customerId === user._id;
          return order.customerId?._id === user._id;
        });

        return {
          id: user._id,
          from: user.name,
          email: user.email,
          subject: latestOrder ? `Order update: ${latestOrder.status}` : 'Welcome to NovaDash',
          body: latestOrder
            ? `Your latest order total is $${latestOrder.total.toFixed(2)} with priority ${latestOrder.priority}.`
            : 'Thanks for joining. No orders yet, our team can help you place your first one.',
          updatedAt: latestOrder?.updatedAt || user.updatedAt,
        };
      });

      container.innerHTML = `
        <h1 class="page-title">Messages</h1>
        <p class="page-subtitle">Simple customer inbox generated from real backend users/orders.</p>

        <div class="panel">
          <div class="panel__header"><h3 class="panel__title">Inbox (${messages.length})</h3></div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr><th>From</th><th>Email</th><th>Subject</th><th>Message</th><th>Updated At</th></tr>
              </thead>
              <tbody>
                ${messages.length === 0 ? `<tr><td colspan="5">No results found</td></tr>` : messages.map((message) => `
                  <tr>
                    <td>${message.from}</td>
                    <td>${message.email}</td>
                    <td>${message.subject}</td>
                    <td>${message.body}</td>
                    <td>${formatDate(message.updatedAt)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (error: any) {
      container.innerHTML = `
        <h1 class="page-title">Messages</h1>
        <p class="page-subtitle">Simple customer inbox generated from real backend users/orders.</p>
        <div class="panel">Error: ${error.message || 'Failed to load messages'}</div>
      `;
    }
  })();
}
