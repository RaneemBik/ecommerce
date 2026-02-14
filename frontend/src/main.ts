

import "./styles.css";
import "./login.css";
import "./admin.css";
import { initRouter } from "./router";
import { siteName, initSiteName } from "./siteConfig";
import { checkHealth } from "./services/api";

// Initialize theme before DOM loads
function initializeTheme() {
  const savedTheme = localStorage.getItem('novadash_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

initializeTheme();

document.addEventListener("DOMContentLoaded", () => {
  // initialize site name in DOM
  initSiteName();
  initRouter();

  // Check backend health
  checkHealth()
    .then((result) => {
      console.log("✅ Backend connected:", result);
    })
    .catch((error) => {
      console.warn("⚠️ Backend connection failed:", error.message);
      console.log("Running in mock data mode.");
    });
});
