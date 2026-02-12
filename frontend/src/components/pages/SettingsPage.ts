import { siteName, setSiteName } from "../../siteConfig";

export function renderSettings(container: HTMLElement) {
  container.innerHTML = `
    <h1 class="page-title">Settings</h1>
    <p class="page-subtitle">Application and account settings.</p>

    <div class="panel">
      <div class="panel__header"><h3 class="panel__title">General</h3></div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <label style="color:var(--text-secondary)">Site name <input class="form-input" data-bind="siteName" value="${siteName}" /></label>
        <label style="color:var(--text-secondary)">Timezone<select class="form-input"><option>UTC</option><option>Local</option></select></label>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px">
          <button class="btn btn--secondary" data-action="cancel">Cancel</button>
          <button class="btn btn--primary" data-action="apply" disabled>Apply</button>
        </div>
      </div>
    </div>
  `;

  // bind input to update site name globally
  const input = container.querySelector<HTMLInputElement>("input[data-bind=siteName]");
  const applyBtn = container.querySelector<HTMLButtonElement>("button[data-action=apply]");
  const cancelBtn = container.querySelector<HTMLButtonElement>("button[data-action=cancel]");

  if (!input || !applyBtn || !cancelBtn) return;

  let original = siteName;
  let staged = input.value || "";

  const updateButtons = () => {
    applyBtn.disabled = staged === original;
  };

  // track changes locally until user clicks Apply
  input.addEventListener("input", () => {
    staged = input.value || "";
    updateButtons();
  });

  cancelBtn.addEventListener("click", () => {
    staged = original;
    input.value = original;
    updateButtons();
  });

  applyBtn.addEventListener("click", () => {
    setSiteName(staged);
    original = staged;
    updateButtons();
  });
}
