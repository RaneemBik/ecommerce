import React from 'react';

export default function AdminWrapper() {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [Comp, setComp] = React.useState<React.ComponentType | null>(null);

  React.useEffect(() => {
    let mounted = true;
    import('../components/AdminComponent').then((mod) => {
      if (!mounted) return;
      const anyMod = mod as any;
      if (anyMod && anyMod.default) {
        setComp(() => anyMod.default as React.ComponentType);
        return;
      }
      if (ref.current && (mod as any)?.renderAdmin) {
        // Call initial render
        mod.renderAdmin(ref.current as HTMLElement);

        // Keep renderer ref so we can call it on client-side navigation
        const renderer = (root: HTMLElement) => (mod as any).renderAdmin(root as HTMLElement);
        const onNav = () => {
          if (!mounted) return;
          try { renderer(ref.current as HTMLElement); } catch (e) { /* ignore */ }
        };
        window.addEventListener('novadash:navigate', onNav);
        // cleanup listener
        const cleanup = () => window.removeEventListener('novadash:navigate', onNav);
        // ensure cleanup on unmount
        (cleanup as any)._mounted = true;
        // attach cleanup to effect return
        (window as any).__novadash_admin_cleanup = cleanup;
      }
    });
    return () => {
      mounted = false;
      const cleanup = (window as any).__novadash_admin_cleanup;
      if (typeof cleanup === 'function') cleanup();
    };
  }, []);

  if (Comp) return <Comp />;
  return <div ref={ref} />;
}
