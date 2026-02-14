/* ─────────────────────────────────────────────────
   NovaDash — Simple SPA Router
   ───────────────────────────────────────────────── */

import { renderLogin } from "./components/LoginComponent";
import { renderRegister } from "./components/RegisterComponent";
import { renderAdmin } from "./components/AdminComponent";
import { isAuthenticated } from "./services/api";

const root = () => document.getElementById("app")!;

const routes: Record<string, (el: HTMLElement) => void> = {
  "/": renderLogin,
  "/register": renderRegister,
  "/admin": renderAdmin,
};

export function navigate(path: string): void {
  history.pushState(null, "", path);
  render(path);
}

export function initRouter(): void {
  // Handle back / forward
  window.addEventListener("popstate", () => {
    render(location.pathname);
  });

  // Intercept link clicks (optional)
  document.addEventListener("click", (e) => {
    const link = (e.target as HTMLElement).closest("a[data-link]");
    if (link) {
      e.preventDefault();
      navigate((link as HTMLAnchorElement).getAttribute("href") || "/");
    }
  });

  // Initial render
  const path = location.pathname;

  // If user already logged in and on root or register, redirect to admin
  if ((path === "/" || path === "/register") && isAuthenticated()) {
    navigate("/admin");
    return;
  }

  // If user not logged in and trying to access any admin route, redirect to login
  if (path.startsWith("/admin") && !isAuthenticated()) {
    navigate("/");
    return;
  }

  render(path);
}

function render(path: string): void {
  if (path.startsWith("/admin") && !isAuthenticated()) {
    navigate("/");
    return;
  }

  if (path === "/") {
    renderLogin(root());
    return;
  }

  if (path === "/register") {
    renderRegister(root());
    return;
  }

  if (path.startsWith("/admin")) {
    renderAdmin(root());
    return;
  }

  const handler = routes[path] || routes["/"];
  handler(root());
}
