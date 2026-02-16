import { icons } from "../../icons";

export function statCardHTML(id: string, label: string, value: string, trend: string, dir: "up" | "down", iconKey: string, color: string) {
  const trendIcon = dir === "up" ? icons.trendUp : icons.trendDown;
  return `
    <div class="stat-card" data-stat-id="${id}">
      <div class="stat-card__header">
        <div class="stat-card__icon stat-card__icon--${color}">
          ${(icons as Record<string, string>)[iconKey] || icons.dashboard}
        </div>
        <span class="stat-card__trend stat-card__trend--${dir}">
          ${trendIcon} ${trend}
        </span>
      </div>
      <div class="stat-card__value" data-stat-value>${value}</div>
      <div class="stat-card__label">${label}</div>
    </div>
  `;
}
