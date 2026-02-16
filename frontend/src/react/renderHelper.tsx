import React from 'react';
import { createRoot, Root } from 'react-dom/client';

const roots = new WeakMap<HTMLElement, Root>();

export function mountReact(el: HTMLElement, element: React.ReactElement) {
  let root = roots.get(el);
  if (!root) {
    root = createRoot(el);
    roots.set(el, root);
  }
  root.render(element);
}

export function unmountReact(el: HTMLElement) {
  const root = roots.get(el);
  if (root) {
    root.unmount();
    roots.delete(el);
  }
}
