import React from 'react';

export default function LoginWrapper() {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [Comp, setComp] = React.useState<React.ComponentType | null>(null);

  React.useEffect(() => {
    let mounted = true;
    import('../components/LoginComponent').then((mod) => {
      if (!mounted) return;
      const anyMod = mod as any;
      if (anyMod && anyMod.default) {
        setComp(() => anyMod.default as React.ComponentType);
        return;
      }
      // fallback: call legacy DOM renderer into the ref container
      if (ref.current && anyMod?.renderLogin) {
        anyMod.renderLogin(ref.current as HTMLElement);
      }
    });
    return () => { mounted = false; };
  }, []);

  if (Comp) return <Comp />;
  return <div ref={ref} />;
}
