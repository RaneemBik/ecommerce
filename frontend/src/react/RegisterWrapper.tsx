import React from 'react';

export default function RegisterWrapper() {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [Comp, setComp] = React.useState<React.ComponentType | null>(null);

  React.useEffect(() => {
    let mounted = true;
    import('../components/RegisterComponent').then((mod) => {
      if (!mounted) return;
      const anyMod = mod as any;
      if (anyMod && anyMod.default) {
        setComp(() => anyMod.default as React.ComponentType);
        return;
      }
      if (ref.current && anyMod?.renderRegister) {
        anyMod.renderRegister(ref.current as HTMLElement);
      }
    });
    return () => { mounted = false; };
  }, []);

  if (Comp) return <Comp />;
  return <div ref={ref} />;
}
