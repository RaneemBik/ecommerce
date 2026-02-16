




import React from 'react';
import { isAuthenticated } from "./services/api";
import { mountReact } from './react/renderHelper';
import LoginWrapper from './react/LoginWrapper';
import RegisterWrapper from './react/RegisterWrapper';
import AdminWrapper from './react/AdminWrapper';

const root = () => document.getElementById("app")!;

const routes: Record<string, (el: HTMLElement) => void> = {
  "/": (el: HTMLElement) => mountReact(el, React.createElement(LoginWrapper)),
  "/register": (el: HTMLElement) => mountReact(el, React.createElement(RegisterWrapper)),
  "/admin": (el: HTMLElement) => mountReact(el, React.createElement(AdminWrapper)),
};

export function navigate(path: string): void {
  history.pushState(null, "", path);
  // notify listeners (wrappers) about navigation so legacy renderers can update
  try {
    window.dispatchEvent(new CustomEvent('novadash:navigate', { detail: path }));
  } catch (e) {
    // ignore
  }
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
    mountReact(root(), React.createElement(LoginWrapper));
    return;
  }

  if (path === "/register") {
    mountReact(root(), React.createElement(RegisterWrapper));
    return;
  }

  if (path.startsWith("/admin")) {
    mountReact(root(), React.createElement(AdminWrapper));
    return;
  }

  const handler = routes[path] || routes["/"];
  handler(root());
}
