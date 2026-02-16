export function confirmModal(message: string, title = 'Confirm'): Promise<boolean> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal__header"><h3>${title}</h3><button class="modal__close" aria-label="Close">&times;</button></div>
      <div class="modal__content"><p>${message}</p></div>
      <div class="modal__actions"><button class="btn btn--secondary modal-cancel">Cancel</button><button class="btn btn--primary modal-confirm">OK</button></div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const cleanup = (result: boolean) => {
      try { document.body.removeChild(overlay); } catch (e) {}
      resolve(result);
    };

    overlay.addEventListener('click', (e) => { if (e.target === overlay) cleanup(false); });
    modal.querySelector('.modal__close')?.addEventListener('click', () => cleanup(false));
    modal.querySelector<HTMLElement>('.modal-cancel')?.addEventListener('click', () => cleanup(false));
    modal.querySelector<HTMLElement>('.modal-confirm')?.addEventListener('click', () => cleanup(true));
  });
}

export function showToast(message: string, timeout = 3000) {
  const containerId = 'novadash-toast-container';
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = message;
  container.appendChild(t);
  requestAnimationFrame(() => t.classList.add('toast--visible'));
  setTimeout(() => { t.classList.remove('toast--visible'); setTimeout(() => t.remove(), 300); }, timeout);
}
