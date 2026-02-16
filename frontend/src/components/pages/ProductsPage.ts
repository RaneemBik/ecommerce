import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
  type Product,
} from '../../services/adminApi';
import { confirmModal, showToast } from '../../ui/modal';

type ProductQuery = {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  name: string;
  category: string;
  inStock: '' | 'true' | 'false';
  minPrice: string;
  maxPrice: string;
  from: string;
  to: string;
};

const initialQuery: ProductQuery = {
  page: 1,
  limit: 10,
  sort: 'createdAt',
  order: 'desc',
  name: '',
  category: '',
  inStock: '',
  minPrice: '',
  maxPrice: '',
  from: '',
  to: '',
};

function formatDate(value?: string) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString();
}

function productDetailsModal(product: Product) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal__header">
      <h3>Product Details</h3>
      <button class="modal__close" aria-label="Close">&times;</button>
    </div>
    <div class="modal__content">
      <p><strong>SKU:</strong> ${product.sku}</p>
      <p><strong>Name:</strong> ${product.name}</p>
      <p><strong>Description:</strong> ${product.description || '-'}</p>
      <p><strong>Category:</strong> ${product.category || '-'}</p>
      <p><strong>Price:</strong> $${product.price.toFixed(2)}</p>
      <p><strong>Stock:</strong> ${product.stock}</p>
      <p><strong>Created At:</strong> ${formatDate(product.createdAt)}</p>
      <p><strong>Updated At:</strong> ${formatDate(product.updatedAt)}</p>
    </div>
    <div class="modal__actions">
      <button class="btn btn--primary modal-ok">OK</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const close = () => {
    try {
      document.body.removeChild(overlay);
    } catch {
      return;
    }
  };

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });
  modal.querySelector('.modal__close')?.addEventListener('click', close);
  modal.querySelector('.modal-ok')?.addEventListener('click', close);
}

export function renderProducts(container: HTMLElement) {
  let query: ProductQuery = { ...initialQuery };
  let editingId: string | null = null;

  async function loadData() {
    container.innerHTML = `<h1 class="page-title">Products</h1><p class="page-subtitle">Manage products with real backend data.</p><div class="panel">Loading products...</div>`;
    try {
      const result = await listProducts(query);
      render(result.items, result.total, result.page, result.pages);
    } catch (error: any) {
      container.innerHTML = `<h1 class="page-title">Products</h1><p class="page-subtitle">Manage products with real backend data.</p><div class="panel">Error: ${error.message || 'Failed to load products'}</div>`;
    }
  }

  function render(items: Product[], total: number, page: number, pages: number) {
    container.innerHTML = `
      <h1 class="page-title">Products</h1>
      <p class="page-subtitle">Manage products with real backend data.</p>

      <div class="panel" style="margin-bottom:12px">
        <div class="panel__header"><h3 class="panel__title">Filters</h3></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px">
          <input id="qName" class="form-input" placeholder="Search by name" value="${query.name}" />
          <input id="qCategory" class="form-input" placeholder="Category" value="${query.category}" />
          <select id="qInStock" class="form-input">
            <option value="" ${query.inStock === '' ? 'selected' : ''}>Status: All</option>
            <option value="true" ${query.inStock === 'true' ? 'selected' : ''}>Status: In stock</option>
            <option value="false" ${query.inStock === 'false' ? 'selected' : ''}>Status: Out of stock</option>
          </select>
          <input id="qMinPrice" class="form-input" type="number" placeholder="Min price" value="${query.minPrice}" />
          <input id="qMaxPrice" class="form-input" type="number" placeholder="Max price" value="${query.maxPrice}" />
          <input id="qFrom" class="form-input" type="date" value="${query.from}" />
          <input id="qTo" class="form-input" type="date" value="${query.to}" />
          <select id="qSort" class="form-input">
            <option value="createdAt" ${query.sort === 'createdAt' ? 'selected' : ''}>Sort: Created At</option>
            <option value="updatedAt" ${query.sort === 'updatedAt' ? 'selected' : ''}>Sort: Updated At</option>
            <option value="name" ${query.sort === 'name' ? 'selected' : ''}>Sort: Name</option>
            <option value="price" ${query.sort === 'price' ? 'selected' : ''}>Sort: Price</option>
            <option value="stock" ${query.sort === 'stock' ? 'selected' : ''}>Sort: Stock</option>
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
        <div class="panel__header"><h3 class="panel__title">${editingId ? 'Edit Product' : 'Create Product'}</h3></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px">
          <input id="fSku" class="form-input" placeholder="SKU" />
          <input id="fName" class="form-input" placeholder="Name" />
          <input id="fCategory" class="form-input" placeholder="Category" />
          <input id="fPrice" class="form-input" type="number" placeholder="Price" />
          <input id="fStock" class="form-input" type="number" placeholder="Stock" />
          <input id="fDescription" class="form-input" placeholder="Description" />
          <button id="saveProduct" class="btn btn--primary">${editingId ? 'Update' : 'Create'}</button>
          <button id="resetProduct" class="btn btn--secondary">Reset</button>
        </div>
      </div>

      <div class="panel">
        <div class="panel__header"><h3 class="panel__title">Products (${total})</h3></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr><th>SKU</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Created At</th><th>Updated At</th><th>Actions</th></tr>
            </thead>
            <tbody>
              ${items.length === 0 ? `<tr><td colspan="8">No results found</td></tr>` : items.map((product) => `
                <tr>
                  <td>${product.sku}</td>
                  <td>${product.name}</td>
                  <td>${product.category || '-'}</td>
                  <td>$${product.price.toFixed(2)}</td>
                  <td>${product.stock}</td>
                  <td>${formatDate(product.createdAt)}</td>
                  <td>${formatDate(product.updatedAt)}</td>
                  <td style="display:flex;gap:8px;flex-wrap:wrap">
                    <button class="btn btn--secondary btn--small detail-product" data-id="${product._id}">Details</button>
                    <button class="btn btn--secondary btn--small edit-product" data-id="${product._id}">Edit</button>
                    <button class="btn btn--danger btn--small delete-product" data-id="${product._id}">Delete</button>
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

    const qName = document.getElementById('qName') as HTMLInputElement;
    const qCategory = document.getElementById('qCategory') as HTMLInputElement;
    const qInStock = document.getElementById('qInStock') as HTMLSelectElement;
    const qMinPrice = document.getElementById('qMinPrice') as HTMLInputElement;
    const qMaxPrice = document.getElementById('qMaxPrice') as HTMLInputElement;
    const qFrom = document.getElementById('qFrom') as HTMLInputElement;
    const qTo = document.getElementById('qTo') as HTMLInputElement;
    const qSort = document.getElementById('qSort') as HTMLSelectElement;
    const qOrder = document.getElementById('qOrder') as HTMLSelectElement;
    const qLimit = document.getElementById('qLimit') as HTMLSelectElement;

    (document.getElementById('applyFilters') as HTMLButtonElement).addEventListener('click', () => {
      query = {
        ...query,
        page: 1,
        name: qName.value.trim(),
        category: qCategory.value.trim(),
        inStock: qInStock.value as '' | 'true' | 'false',
        minPrice: qMinPrice.value,
        maxPrice: qMaxPrice.value,
        from: qFrom.value,
        to: qTo.value,
        sort: qSort.value,
        order: qOrder.value as 'asc' | 'desc',
        limit: Number(qLimit.value),
      };
      void loadData();
    });

    const fSku = document.getElementById('fSku') as HTMLInputElement;
    const fName = document.getElementById('fName') as HTMLInputElement;
    const fCategory = document.getElementById('fCategory') as HTMLInputElement;
    const fPrice = document.getElementById('fPrice') as HTMLInputElement;
    const fStock = document.getElementById('fStock') as HTMLInputElement;
    const fDescription = document.getElementById('fDescription') as HTMLInputElement;

    (document.getElementById('resetProduct') as HTMLButtonElement).addEventListener('click', () => {
      editingId = null;
      void loadData();
    });

    (document.getElementById('saveProduct') as HTMLButtonElement).addEventListener('click', async () => {
      const payload = {
        sku: fSku.value.trim(),
        name: fName.value.trim(),
        category: fCategory.value.trim(),
        price: Number(fPrice.value),
        stock: Number(fStock.value),
        description: fDescription.value.trim(),
      };

      if (!payload.sku || !payload.name || Number.isNaN(payload.price) || Number.isNaN(payload.stock)) {
        showToast('SKU, name, price, and stock are required');
        return;
      }

      try {
        if (editingId) {
          await updateProduct(editingId, payload);
          showToast('Product updated');
        } else {
          await createProduct(payload);
          showToast('Product created');
        }
        editingId = null;
        window.dispatchEvent(new Event('novadash:data-changed'));
        void loadData();
      } catch (error: any) {
        showToast(error.message || 'Failed to save product');
      }
    });

    container.querySelectorAll<HTMLButtonElement>('.detail-product').forEach((button) => {
      button.addEventListener('click', async () => {
        const id = button.dataset.id;
        if (!id) return;
        try {
          const product = await getProduct(id);
          productDetailsModal(product);
        } catch (error: any) {
          showToast(error.message || 'Failed to load product details');
        }
      });
    });

    container.querySelectorAll<HTMLButtonElement>('.edit-product').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.dataset.id;
        const product = items.find((item) => item._id === id);
        if (!product) return;
        editingId = product._id;
        fSku.value = product.sku;
        fName.value = product.name;
        fCategory.value = product.category || '';
        fPrice.value = String(product.price);
        fStock.value = String(product.stock);
        fDescription.value = product.description || '';
      });
    });

    container.querySelectorAll<HTMLButtonElement>('.delete-product').forEach((button) => {
      button.addEventListener('click', async () => {
        const id = button.dataset.id;
        if (!id) return;
        const ok = await confirmModal('Delete this product?', 'Delete Product');
        if (!ok) return;
        try {
          await deleteProduct(id);
          showToast('Product deleted (soft delete)');
          window.dispatchEvent(new Event('novadash:data-changed'));
          void loadData();
        } catch (error: any) {
          showToast(error.message || 'Failed to delete product');
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
