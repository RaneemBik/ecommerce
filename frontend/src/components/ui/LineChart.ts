type SeriesPoint = { label: string; value: number };
// lightweight local type used instead of missing ../../mockData

// import { SeriesPoint } from "../../mockData";

export function renderLineChart(container: HTMLElement, series: SeriesPoint[]) {
  const width = 600;
  const height = 220;
  const max = Math.max(...series.map(s => s.value)) || 1;
  const points = series.map((s, i) => `${(i/(series.length-1 || 1))*100}% ${(100 - (s.value/max)*100)}%`).join(',');

  // responsive svg using viewBox
  const svg = `
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" class="line-chart-svg">
      <polyline fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${series.map((s,i)=>`${(i/(series.length-1||1))*width},${height - (s.value/max)*height}`).join(' ')}" />
      ${series.map((s,i)=>`<circle cx="${(i/(series.length-1||1))*width}" cy="${height - (s.value/max)*height}" r="3" fill="var(--accent)"/>`).join('')}
    </svg>
  `;

  container.innerHTML = svg;
}
