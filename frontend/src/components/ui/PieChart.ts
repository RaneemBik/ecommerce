export function renderPieChart(container: HTMLElement, data: {label:string,value:number}[]) {
  const total = data.reduce((s,d)=>s+d.value,0) || 1;
  let angle = -90; // start at top
  const parts: string[] = [];
  const size = 160;
  data.forEach((d, i) => {
    const portion = d.value / total;
    const a = portion * 360;
    const large = a > 180 ? 1 : 0;
    const start = angle;
    const end = angle + a;
    const x1 = 80 + 80 * Math.cos((Math.PI/180)*start);
    const y1 = 80 + 80 * Math.sin((Math.PI/180)*start);
    const x2 = 80 + 80 * Math.cos((Math.PI/180)*end);
    const y2 = 80 + 80 * Math.sin((Math.PI/180)*end);
    const path = `<path d="M80 80 L ${x1} ${y1} A 80 80 0 ${large} 1 ${x2} ${y2} Z" fill="hsl(${(i*65)%360} 70% 55%)" />`;
    parts.push(path);
    angle = end;
  });

  const legend = data.map((d,i)=>`<div class="pie-legend-item"><span class="pie-swatch" style="background:hsl(${(i*65)%360} 70% 55%)"></span>${d.label} <strong style="float:right">${Math.round((d.value/total)*100)}%</strong></div>`).join('');

  container.innerHTML = `
    <div style="display:flex;gap:12px;align-items:center">
      <svg viewBox="0 0 160 160" width="160" height="160" class="pie-chart-svg">${parts.join('')}</svg>
      <div style="flex:1">${legend}</div>
    </div>
  `;
}
