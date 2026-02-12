

import "./styles.css";
import "./login.css";
import "./admin.css";
import { initRouter } from "./router";
import { siteName, initSiteName } from "./siteConfig";
import { checkHealth } from "./services/api";

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
