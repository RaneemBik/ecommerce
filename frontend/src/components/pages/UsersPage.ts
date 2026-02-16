import { createUser, deleteUser, listUsers, updateUser, type Customer } from '../../services/adminApi';
import { confirmModal, showToast } from '../../ui/modal';

type UserQuery = {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  name: string;
  email: string;
  from: string;
  to: string;
};

const initialQuery: UserQuery = {
  page: 1,
  limit: 10,
  sort: 'createdAt',
  order: 'desc',
  name: '',
  email: '',
  from: '',
  to: '',
};

function formatDate(value?: string) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString();
}

export function renderUsers(container: HTMLElement) {
  let query: UserQuery = { ...initialQuery };
  let editingId: string | null = null;

  async function loadData() {
    container.innerHTML = `<h1 class="page-title">Users</h1><p class="page-subtitle">Manage your users with real backend data.</p><div class="panel">Loading users...</div>`;

    try {
      const result = await listUsers(query);
      render(result.items, result.total, result.page, result.pages);
    } catch (error: any) {
      container.innerHTML = `<h1 class="page-title">Users</h1><p class="page-subtitle">Manage your users with real backend data.</p><div class="panel">Error: ${error.message || 'Failed to load users'}</div>`;
    }
  }

  function render(items: Customer[], total: number, page: number, pages: number) {
    container.innerHTML = `
      <h1 class="page-title">Users</h1>
      <p class="page-subtitle">Manage your users with real backend data.</p>

      <div class="panel" style="margin-bottom:12px">
        <div class="panel__header"><h3 class="panel__title">Filters</h3></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px">
          <input id="qName" class="form-input" placeholder="Search by name" value="${query.name}" />
          <input id="qEmail" class="form-input" placeholder="Search by email" value="${query.email}" />
          <input id="qFrom" class="form-input" type="date" value="${query.from}" />
          <input id="qTo" class="form-input" type="date" value="${query.to}" />
          <select id="qSort" class="form-input">
            <option value="createdAt" ${query.sort === 'createdAt' ? 'selected' : ''}>Sort: Created At</option>
            <option value="updatedAt" ${query.sort === 'updatedAt' ? 'selected' : ''}>Sort: Updated At</option>
            <option value="name" ${query.sort === 'name' ? 'selected' : ''}>Sort: Name</option>
            <option value="email" ${query.sort === 'email' ? 'selected' : ''}>Sort: Email</option>
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
        <div class="panel__header"><h3 class="panel__title">${editingId ? 'Edit User' : 'Create User'}</h3></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px">
          <input id="fName" class="form-input" placeholder="Name" />
          <input id="fEmail" class="form-input" placeholder="Email" type="email" />
          <input id="fPhone" class="form-input" placeholder="Phone" />
          <input id="fAddress" class="form-input" placeholder="Address" />
          <button id="saveUser" class="btn btn--primary">${editingId ? 'Update' : 'Create'}</button>
          <button id="resetUser" class="btn btn--secondary">Reset</button>
        </div>
      </div>

      <div class="panel">
        <div class="panel__header"><h3 class="panel__title">All Users (${total})</h3></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Created At</th><th>Updated At</th><th>Actions</th></tr>
            </thead>
            <tbody>
              ${items.length === 0 ? `<tr><td colspan="6">No results found</td></tr>` : items.map((user) => `
                <tr>
                  <td>${user.name}</td>
                  <td>${user.email}</td>
                  <td>${user.phone || '-'}</td>
                  <td>${formatDate(user.createdAt)}</td>
                  <td>${formatDate(user.updatedAt)}</td>
                  <td style="display:flex;gap:8px">
                    <button class="btn btn--secondary btn--small edit-user" data-id="${user._id}">Edit</button>
                    <button class="btn btn--danger btn--small delete-user" data-id="${user._id}">Delete</button>
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

    const applyFilters = document.getElementById('applyFilters') as HTMLButtonElement;
    const qName = document.getElementById('qName') as HTMLInputElement;
    const qEmail = document.getElementById('qEmail') as HTMLInputElement;
    const qFrom = document.getElementById('qFrom') as HTMLInputElement;
    const qTo = document.getElementById('qTo') as HTMLInputElement;
    const qSort = document.getElementById('qSort') as HTMLSelectElement;
    const qOrder = document.getElementById('qOrder') as HTMLSelectElement;
    const qLimit = document.getElementById('qLimit') as HTMLSelectElement;

    applyFilters.addEventListener('click', () => {
      query = {
        ...query,
        page: 1,
        name: qName.value.trim(),
        email: qEmail.value.trim(),
        from: qFrom.value,
        to: qTo.value,
        sort: qSort.value,
        order: qOrder.value as 'asc' | 'desc',
        limit: Number(qLimit.value),
      };
      void loadData();
    });

    const fName = document.getElementById('fName') as HTMLInputElement;
    const fEmail = document.getElementById('fEmail') as HTMLInputElement;
    const fPhone = document.getElementById('fPhone') as HTMLInputElement;
    const fAddress = document.getElementById('fAddress') as HTMLInputElement;
    const saveUser = document.getElementById('saveUser') as HTMLButtonElement;
    const resetUser = document.getElementById('resetUser') as HTMLButtonElement;

    resetUser.addEventListener('click', () => {
      editingId = null;
      void loadData();
    });

    saveUser.addEventListener('click', async () => {
      const payload = {
        name: fName.value.trim(),
        email: fEmail.value.trim(),
        phone: fPhone.value.trim(),
        address: fAddress.value.trim(),
      };

      if (!payload.name || !payload.email) {
        showToast('Name and email are required');
        return;
      }

      try {
        if (editingId) {
          await updateUser(editingId, payload);
          showToast('User updated');
        } else {
          await createUser(payload);
          showToast('User created');
        }
        editingId = null;
        window.dispatchEvent(new Event('novadash:data-changed'));
        void loadData();
      } catch (error: any) {
        showToast(error.message || 'Failed to save user');
      }
    });

    container.querySelectorAll<HTMLButtonElement>('.edit-user').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.dataset.id;
        const user = items.find((item) => item._id === id);
        if (!user) return;
        editingId = user._id;
        fName.value = user.name;
        fEmail.value = user.email;
        fPhone.value = user.phone || '';
        fAddress.value = user.address || '';
      });
    });

    container.querySelectorAll<HTMLButtonElement>('.delete-user').forEach((button) => {
      button.addEventListener('click', async () => {
        const id = button.dataset.id;
        if (!id) return;
        const ok = await confirmModal('Delete this user?', 'Delete User');
        if (!ok) return;
        try {
          await deleteUser(id);
          showToast('User deleted (soft delete)');
          window.dispatchEvent(new Event('novadash:data-changed'));
          void loadData();
        } catch (error: any) {
          showToast(error.message || 'Failed to delete user');
        }
      });
    });

    const prevPage = document.getElementById('prevPage') as HTMLButtonElement;
    const nextPage = document.getElementById('nextPage') as HTMLButtonElement;

    prevPage.addEventListener('click', () => {
      if (query.page > 1) {
        query.page -= 1;
        void loadData();
      }
    });

    nextPage.addEventListener('click', () => {
      if (!pages || query.page < pages) {
        query.page += 1;
        void loadData();
      }
    });
  }

  void loadData();
}
