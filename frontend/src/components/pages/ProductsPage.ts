type Product = { id: number; title: string; price: number; active: boolean; createdAt: string };

const PROD_KEY = 'novadash_products';

function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PROD_KEY);
    if (raw) return JSON.parse(raw) as Product[];
  } catch (e) {}
  const defaults: Product[] = [
    { id: 1, title: 'IPhone 14', price: 400, active: true, createdAt: new Date().toISOString() },
    { id: 2, title: 'Samsung Galaxy S21', price: 350, active: true, createdAt: new Date().toISOString() },
    { id: 3, title: 'Google Pixel 6', price: 299, active: true, createdAt: new Date().toISOString() },
    { id: 4, title: 'OnePlus 9', price: 350, active: true, createdAt: new Date().toISOString() },
    { id: 5, title: 'Pixel 6a', price: 299, active: true, createdAt: new Date().toISOString() },
  ];
  try { localStorage.setItem(PROD_KEY, JSON.stringify(defaults)); } catch (e) {}
  return defaults;
}

function saveProducts(list: Product[]) {
  try { localStorage.setItem(PROD_KEY, JSON.stringify(list)); } catch (e) {}
}

function renderProductCard(p: Product) {
  return `
    <div class="product-card panel" data-id="${p.id}" style="flex:1;min-width:220px;position:relative">
      <div style="padding:14px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong>${p.title}</strong>
          ${p.active ? '<span class="badge" style="background:var(--success);color:#072">Active</span>' : '<span class="badge">Inactive</span>'}
        </div>
        <div style="margin-top:8px;color:var(--text-secondary)">$${p.price}</div>
      </div>
    </div>
  `;
}

export function renderProducts(container: HTMLElement) {
  const products = loadProducts();

  container.innerHTML = `
    <h1 class="page-title">Products</h1>
    <p class="page-subtitle">Manage your product catalog and inventory.</p>

    <div class="panel">
      <div class="panel__header"><h3 class="panel__title">Latest Products</h3><button id="newProductBtn" class="panel__action">New Product</button></div>
      <div id="productsGrid" style="display:flex;gap:12px;flex-wrap:wrap"></div>
    </div>

    <div id="newProductFormContainer" style="margin-top:12px"></div>
  `;

  const grid = document.getElementById('productsGrid')!;
  function refreshGrid() {
    const list = loadProducts();
    grid.innerHTML = list.map(renderProductCard).join('');
    // attach click to cards to toggle active
    grid.querySelectorAll<HTMLElement>('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = Number(card.dataset.id);
        const list = loadProducts();
        const idx = list.findIndex(p => p.id === id);
        if (idx >= 0) {
          list[idx].active = !list[idx].active;
          saveProducts(list);
          refreshGrid();
        }
      });
    });
  }

  refreshGrid();

  const newBtn = document.getElementById('newProductBtn')!;
  const formContainer = document.getElementById('newProductFormContainer')!;

  function openNewForm() {
    formContainer.innerHTML = `
      <div class="panel">
        <div class="panel__header"><h3 class="panel__title">Create Product</h3></div>
        <div style="padding:12px;display:flex;gap:8px;flex-direction:column">
          <label>Title <input id="np_title" class="form-input" /></label>
          <label>Price <input id="np_price" class="form-input" type="number" value="0"/></label>
          <label><input id="np_active" type="checkbox" checked/> Active</label>
          <div style="display:flex;gap:8px;margin-top:8px">
            <button id="np_save" class="btn">Save</button>
            <button id="np_cancel" class="btn btn--muted">Cancel</button>
          </div>
        </div>
      </div>
    `;

    const saveBtn = document.getElementById('np_save')!;
    const cancelBtn = document.getElementById('np_cancel')!;
    saveBtn.addEventListener('click', ()=>{
      const title = (document.getElementById('np_title') as HTMLInputElement).value.trim() || 'Untitled';
      const price = Number((document.getElementById('np_price') as HTMLInputElement).value) || 0;
      const active = (document.getElementById('np_active') as HTMLInputElement).checked;
      const list = loadProducts();
      const id = list.reduce((m,p)=>Math.max(m,p.id), 0) + 1;
      const prod: Product = { id, title, price, active, createdAt: new Date().toISOString() };
      list.unshift(prod);
      saveProducts(list);
      formContainer.innerHTML = '';
      refreshGrid();
    });

    cancelBtn.addEventListener('click', ()=>{ formContainer.innerHTML = ''; });
  }

  newBtn.addEventListener('click', ()=> openNewForm());
}
