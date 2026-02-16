export function updateProgressRing(pct: number, total: number, goal: number) {
  const ring = document.querySelector('.progress-ring__fill') as SVGCircleElement | null;
  if (!ring) return;
  const circumference = 2 * Math.PI * 50;
  const offset = circumference - (pct/100) * circumference;
  ring.style.strokeDasharray = String(circumference);
  ring.style.strokeDashoffset = String(offset);
  const pv = document.getElementById('progressValue'); if (pv) pv.textContent = pct + '%';
  const pl = document.getElementById('progressLabel'); if (pl) pl.textContent = `$${total.toLocaleString()} of $${goal.toLocaleString()} goal`;
}
