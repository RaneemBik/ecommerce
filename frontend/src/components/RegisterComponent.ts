
import { icons } from "../icons";
import { navigate } from "../router";
import { siteName } from "../siteConfig";
import { register } from "../services/api";

export function renderRegister(root: HTMLElement): void {
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
            Join us and experience powerful admin tools at your fingertips.
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

          <h2 class="login-card__heading">Create Account</h2>
          <p class="login-card__sub">Sign up to get started with your admin dashboard.</p>

          <form id="registerForm" novalidate autocomplete="off">
            <!-- Name -->
            <div class="form-group">
              <label class="form-label" for="name">Full Name</label>
              <div class="form-input-wrap">
                <span class="form-input-icon">${icons.user}</span>
                <input
                  id="name"
                  class="form-input"
                  type="text"
                  placeholder="Enter your full name"
                  autocomplete="name"
                />
              </div>
              <div class="form-error" id="nameError">Name must be at least 2 characters.</div>
            </div>

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
                  autocomplete="new-password"
                />
                <button type="button" class="form-toggle-pw" id="togglePw" aria-label="Toggle password visibility">
                  ${icons.eye}
                </button>
              </div>
              <div class="form-error" id="pwError">Password must be at least 6 characters.</div>
            </div>

            <!-- Terms -->
            <div class="form-row">
              <label class="form-check">
                <input type="checkbox" id="terms" />
                I agree to the Terms & Privacy Policy
              </label>
            </div>

            <!-- Submit -->
            <button type="submit" class="btn-login" id="registerBtn">
              <span class="btn-text">Create Account</span>
              <span class="spinner"></span>
            </button>
          </form>

          <p class="login-footer">
            Already have an account? <a href="#" id="loginLink">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `;

  bindRegisterEvents();
}

/* ─── Event Logic ─── */
function bindRegisterEvents(): void {
  const form = document.getElementById("registerForm") as HTMLFormElement;
  const nameInput = document.getElementById("name") as HTMLInputElement;
  const emailInput = document.getElementById("email") as HTMLInputElement;
  const pwInput = document.getElementById("password") as HTMLInputElement;
  const termsCheck = document.getElementById("terms") as HTMLInputElement;
  const togglePw = document.getElementById("togglePw") as HTMLButtonElement;
  const nameError = document.getElementById("nameError") as HTMLElement;
  const emailError = document.getElementById("emailError") as HTMLElement;
  const pwError = document.getElementById("pwError") as HTMLElement;
  const registerBtn = document.getElementById("registerBtn") as HTMLButtonElement;
  const loginLink = document.getElementById("loginLink") as HTMLAnchorElement;

  // Navigate to login
  loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    navigate("/");
  });

  // Toggle password visibility
  togglePw.addEventListener("click", () => {
    const isPassword = pwInput.type === "password";
    pwInput.type = isPassword ? "text" : "password";
    togglePw.innerHTML = isPassword ? icons.eyeOff : icons.eye;
  });

  // Clear errors on input
  nameInput.addEventListener("input", () => {
    nameInput.classList.remove("form-input--error");
    nameError.classList.remove("visible");
    nameInput.removeAttribute('aria-invalid');
    nameInput.removeAttribute('aria-describedby');
  });

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

    // Name validation
    if (nameInput.value.trim().length < 2) {
      nameInput.classList.add("form-input--error");
      nameError.classList.add("visible");
      nameInput.setAttribute('aria-invalid', 'true');
      nameInput.setAttribute('aria-describedby', 'nameError');
      valid = false;
    }

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

    // Terms validation
    if (!termsCheck.checked) {
      pwError.textContent = "You must agree to the Terms & Privacy Policy.";
      pwError.classList.add("visible");
      valid = false;
    }

    if (!valid) {
      // focus first invalid field
      if (nameInput.classList.contains('form-input--error')) {
        nameInput.focus();
      } else if (emailInput.classList.contains('form-input--error')) {
        emailInput.focus();
      } else if (pwInput.classList.contains('form-input--error')) {
        pwInput.focus();
      }
      return;
    }

    // API registration
    registerBtn.classList.add("loading");
    registerBtn.disabled = true;

    register({
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      password: pwInput.value,
    })
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        registerBtn.classList.remove("loading");
        registerBtn.disabled = false;

        // Show error message
        emailInput.classList.add("form-input--error");
        emailError.textContent = error.message || "Registration failed. Email may already exist.";
        emailError.classList.add("visible");
        emailInput.setAttribute('aria-invalid', 'true');
        emailInput.setAttribute('aria-describedby', 'emailError');
        emailInput.focus();
      });
  });
}
