import "./styles.css";
import "./login.css";
import "./admin.css";
import { initRouter } from "./router";
import { initSiteName } from "./siteConfig";
import { checkHealth } from "./services/api";

function initializeTheme() {
  const savedTheme = localStorage.getItem('novadash_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

initializeTheme();

// initialize site name in DOM and router
initSiteName();
initRouter();

// Check backend health
checkHealth()
  .then((result) => {
    console.log("✅ Backend connected:", result);
  })
  .catch((error) => {
    console.warn("⚠️ Backend connection failed:", error?.message || error);
    console.log("Running in mock data mode.");
  });
