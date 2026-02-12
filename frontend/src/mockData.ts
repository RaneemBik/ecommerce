export type SeriesPoint = { label: string; value: number };

export function generateSeries(period: '7d' | '30d' | '12m'): SeriesPoint[] {
  const series: SeriesPoint[] = [];
  if (period === '7d') {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (let i = 0; i < 7; i++) {
      series.push({ label: labels[i], value: Math.round(50 + Math.random() * 150) });
    }
  } else if (period === '30d') {
    for (let i = 1; i <= 30; i++) {
      series.push({ label: String(i), value: Math.round(20 + Math.random() * 200) });
    }
  } else {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    for (let i = 0; i < 12; i++) {
      series.push({ label: months[i], value: Math.round(200 + Math.random() * 800) });
    }
  }
  return series;
}
