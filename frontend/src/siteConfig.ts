export let siteName = "Nitro";

const STORAGE_KEY = "nitro_siteName";

export function setSiteName(name: string) {
  siteName = name;
  try {
    localStorage.setItem(STORAGE_KEY, name);
  } catch (e) {
    // ignore storage errors
  }
  // update document title
  try {
    document.title = `${name} — Admin Panel`;
  } catch (e) {
    // ignore in non-browser contexts
  }

  // update all elements that declare data-site-name
  if (typeof document !== "undefined") {
    document.querySelectorAll<HTMLElement>("[data-site-name]").forEach((el) => {
      el.textContent = name;
    });

    // update bound inputs (settings page)
    document.querySelectorAll<HTMLInputElement>("input[data-bind=siteName]").forEach((input) => {
      input.value = name;
    });
  }
}

// Helper: initialize on load
export function initSiteName() {
  // try to load saved name from localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved.trim().length) {
      setSiteName(saved);
      return;
    }
  } catch (e) {
    // ignore
  }
  setSiteName(siteName);
}
