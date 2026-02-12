/* ─────────────────────────────────────────────────
   NovaDash — Login Component
   ───────────────────────────────────────────────── */

import { icons } from "../icons";
import { navigate } from "../router";
import { siteName } from "../siteConfig";
import { login } from "../services/api";

export function renderLogin(root: HTMLElement): void {
  root.innerHTML = /* html */ `
    <div class="login-wrapper">
      <!-- Left visual panel -->
      <div class="login-visual">
        <div class="login-visual__grid"></div>
        <div class="login-visual__orbs">
          <div class="login-visual__orb login-visual__orb--1"></div>
          <div class="login-visual__orb login-visual__orb--2"></div>
          <div class="login-visual__orb login-visual__orb--3"></div>
        </div>
        <div class="login-visual__content">
          <div class="login-visual__logo">N</div>
          <h1 class="login-visual__title" data-site-name>${siteName}</h1>
          <p class="login-visual__subtitle">
            A powerful, beautiful admin experience to take control of your data.
          </p>
        </div>
      </div>

      <!-- Right form side -->
      <div class="login-form-side">
        <div class="login-card">
          <div class="login-card__brand">
            <div class="login-card__brand-icon">N</div>
            <span class="login-card__brand-name" data-site-name>${siteName}</span>
          </div>

          <h2 class="login-card__heading">Welcome back</h2>
          <p class="login-card__sub">Enter your credentials to access the admin dashboard.</p>

          <form id="loginForm" novalidate autocomplete="off">
            <!-- Email -->
            <div class="form-group">
              <label class="form-label" for="email">Email</label>
              <div class="form-input-wrap">
                <span class="form-input-icon">${icons.mail}</span>
                <input
                  id="email"
                  class="form-input"
                  type="email"
                  placeholder="you@example.com"
                  autocomplete="email"
                />
              </div>
              <div class="form-error" id="emailError">Please enter a valid email address.</div>
            </div>

            <!-- Password -->
            <div class="form-group">
              <label class="form-label" for="password">Password</label>
              <div class="form-input-wrap">
                <span class="form-input-icon">${icons.lock}</span>
                <input
                  id="password"
                  class="form-input"
                  type="password"
                  placeholder="••••••••"
                  autocomplete="current-password"
                />
                <button type="button" class="form-toggle-pw" id="togglePw" aria-label="Toggle password visibility">
                  ${icons.eye}
                </button>
              </div>
              <div class="form-error" id="pwError">Password must be at least 6 characters.</div>
            </div>

            <!-- Remember / Forgot -->
            <div class="form-row">
              <label class="form-check">
                <input type="checkbox" checked />
                Remember me
              </label>
              <a href="#" class="form-forgot">Forgot password?</a>
            </div>

            <!-- Submit -->
            <button type="submit" class="btn-login" id="loginBtn">
              <span class="btn-text">Sign in</span>
              <span class="spinner"></span>
            </button>
          </form>

          <p class="login-footer">
            Don't have an account? <a href="#" id="registerLink">Create one</a>
          </p>
        </div>
      </div>
    </div>
  `;

  bindLoginEvents();
}

/* ─── Event Logic ─── */
function bindLoginEvents(): void {
  const form = document.getElementById("loginForm") as HTMLFormElement;
  const emailInput = document.getElementById("email") as HTMLInputElement;
  const pwInput = document.getElementById("password") as HTMLInputElement;
  const togglePw = document.getElementById("togglePw") as HTMLButtonElement;
  const emailError = document.getElementById("emailError") as HTMLElement;
  const pwError = document.getElementById("pwError") as HTMLElement;
  const loginBtn = document.getElementById("loginBtn") as HTMLButtonElement;
  const registerLink = document.getElementById("registerLink") as HTMLAnchorElement;

  // Navigate to register
  registerLink.addEventListener("click", (e) => {
    e.preventDefault();
    navigate("/register");
  });

  // Toggle password visibility
  togglePw.addEventListener("click", () => {
    const isPassword = pwInput.type === "password";
    pwInput.type = isPassword ? "text" : "password";
    togglePw.innerHTML = isPassword ? icons.eyeOff : icons.eye;
  });

  // Clear errors on input
  emailInput.addEventListener("input", () => {
    emailInput.classList.remove("form-input--error");
    emailError.classList.remove("visible");
    emailInput.removeAttribute('aria-invalid');
    emailInput.removeAttribute('aria-describedby');
  });

  pwInput.addEventListener("input", () => {
    pwInput.classList.remove("form-input--error");
    pwError.classList.remove("visible");
    pwInput.removeAttribute('aria-invalid');
    pwInput.removeAttribute('aria-describedby');
  });

  // Submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
      emailInput.classList.add("form-input--error");
      emailError.classList.add("visible");
      emailInput.setAttribute('aria-invalid', 'true');
      emailInput.setAttribute('aria-describedby', 'emailError');
      valid = false;
    }

    // Password validation
    if (pwInput.value.length < 6) {
      pwInput.classList.add("form-input--error");
      pwError.classList.add("visible");
      pwInput.setAttribute('aria-invalid', 'true');
      pwInput.setAttribute('aria-describedby', 'pwError');
      valid = false;
    }

    if (!valid) {
      // focus first invalid field
      if (emailInput.classList.contains('form-input--error')) {
        emailInput.focus();
      } else if (pwInput.classList.contains('form-input--error')) {
        pwInput.focus();
      }
      return;
    }

    // API login
    loginBtn.classList.add("loading");
    loginBtn.disabled = true;

    login({
      email: emailInput.value.trim(),
      password: pwInput.value,
    })
      .then((response) => {
        // Store user session
        localStorage.setItem("novadash_user", JSON.stringify({
          name: response.user.name,
          email: response.user.email,
          role: response.user.isAdmin ? "Administrator" : "User",
        }));
        navigate("/admin");
      })
      .catch((error) => {
        loginBtn.classList.remove("loading");
        loginBtn.disabled = false;
        
        // Show error message
        pwInput.classList.add("form-input--error");
        pwError.textContent = error.message || "Invalid credentials. Please try again.";
        pwError.classList.add("visible");
        pwInput.setAttribute('aria-invalid', 'true');
        pwInput.setAttribute('aria-describedby', 'pwError');
        pwInput.focus();
      });
  });
}
