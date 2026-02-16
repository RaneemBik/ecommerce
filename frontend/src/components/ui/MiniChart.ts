type SeriesPoint = { label: string; value: number };
// lightweight local type used instead of missing ../../mockData

// import { SeriesPoint } from "../../mockData";

export function renderMiniChart(container: HTMLElement, labels: HTMLElement, series: SeriesPoint[]) {
  container.innerHTML = series.map(s => `<div class="mini-chart__bar" style="height:0%" data-value="${s.value}"></div>`).join('');
  labels.innerHTML = series.map(s => `<span class="mini-chart__label">${s.label}</span>`).join('');
  // animate with requestAnimationFrame
  requestAnimationFrame(()=>{
    const bars = container.querySelectorAll<HTMLElement>('.mini-chart__bar');
    bars.forEach((b, i) => {
      setTimeout(()=>{
        const max = Math.max(...series.map(x=>x.value)) || 1;
        b.style.height = Math.min(100, (Number(b.dataset.value) / max) * 100) + '%';
      }, i * 40);
    });
  });
}
