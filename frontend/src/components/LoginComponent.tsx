import React from 'react';
import { icons } from "../icons";
import { navigate } from "../router";
import { siteName } from "../siteConfig";
import { login } from "../services/api";

export default function LoginComponent(): React.ReactElement {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [emailError, setEmailError] = React.useState('');
  const [pwError, setPwError] = React.useState('');
  const pwRef = React.useRef<HTMLInputElement | null>(null);

  function validate() {
    let valid = true;
    setEmailError('');
    setPwError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    }
    if (password.length < 6) {
      setPwError('Password must be at least 6 characters.');
      valid = false;
    }
    return valid;
  }

  function togglePw() {
    if (!pwRef.current) return;
    pwRef.current.type = pwRef.current.type === 'password' ? 'text' : 'password';
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    login({ email: email.trim(), password })
      .then((response) => {
        localStorage.setItem('novadash_user', JSON.stringify({
          name: response.user.name,
          email: response.user.email,
          role: response.user.isAdmin ? 'Administrator' : 'User',
        }));
        navigate('/admin');
      })
      .catch((err) => {
        setLoading(false);
        setPwError(err?.message || 'Invalid credentials. Please try again.');
      });
  }

  return (
    <div className="login-wrapper">
      <div className="login-visual">
        <div className="login-visual__grid" />
        <div className="login-visual__orbs">
          <div className="login-visual__orb login-visual__orb--1" />
          <div className="login-visual__orb login-visual__orb--2" />
          <div className="login-visual__orb login-visual__orb--3" />
        </div>
        <div className="login-visual__content">
          <div className="login-visual__logo">N</div>
          <h1 className="login-visual__title" data-site-name>{siteName}</h1>
          <p className="login-visual__subtitle">A powerful, beautiful admin experience to take control of your data.</p>
        </div>
      </div>

      <div className="login-form-side">
        <div className="login-card">
          <div className="login-card__brand">
            <div className="login-card__brand-icon">N</div>
            <span className="login-card__brand-name" data-site-name>{siteName}</span>
          </div>

          <h2 className="login-card__heading">Welcome back</h2>
          <p className="login-card__sub">Enter your credentials to access the admin dashboard.</p>

          <form id="loginForm" noValidate autoComplete="off" onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <div className="form-input-wrap">
                <span className="form-input-icon" dangerouslySetInnerHTML={{ __html: icons.mail }} />
                <input id="email" className={`form-input ${emailError ? 'form-input--error' : ''}`} type="email" placeholder="you@example.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!emailError} aria-describedby={emailError ? 'emailError' : undefined} />
              </div>
              <div className={`form-error ${emailError ? 'visible' : ''}`} id="emailError">{emailError || 'Please enter a valid email address.'}</div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="form-input-wrap">
                <span className="form-input-icon" dangerouslySetInnerHTML={{ __html: icons.lock }} />
                <input id="password" ref={pwRef} className={`form-input ${pwError ? 'form-input--error' : ''}`} type="password" placeholder="••••••••" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!pwError} aria-describedby={pwError ? 'pwError' : undefined} />
                <button type="button" className="form-toggle-pw" id="togglePw" aria-label="Toggle password visibility" onClick={togglePw} dangerouslySetInnerHTML={{ __html: icons.eye }} />
              </div>
              <div className={`form-error ${pwError ? 'visible' : ''}`} id="pwError">{pwError || 'Password must be at least 6 characters.'}</div>
            </div>

            <div className="form-row">
              <label className="form-check">
                <input type="checkbox" defaultChecked />
                Remember me
              </label>
              <a href="#" className="form-forgot">Forgot password?</a>
            </div>

            <button type="submit" className={`btn-login ${loading ? 'loading' : ''}`} id="loginBtn" disabled={loading}>
              <span className="btn-text">Sign in</span>
              <span className="spinner" />
            </button>
          </form>

          {/* social login removed */}

          <p className="login-footer">Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Create one</a></p>
        </div>
      </div>
    </div>
  );
}

// Backwards-compatible render helper for wrappers that expect a render function
export function renderLogin(root: HTMLElement) {
  // mount React component into the provided root
  // lazy require to avoid top-level React import in non-React contexts
  // but using ReactDOM client createRoot
  // create a small mount helper so multiple mounts don't conflict
  // keep it simple: replace root.innerHTML and render component
  import('react-dom/client').then(({ createRoot }) => {
    // clear root
    root.innerHTML = '';
    const r = createRoot(root);
    r.render(React.createElement(LoginComponent));
  });
}
