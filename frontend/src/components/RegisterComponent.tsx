import React from 'react';
import { icons } from "../icons";
import { navigate } from "../router";
import { siteName } from "../siteConfig";
import { register } from "../services/api";

export default function RegisterComponent(): React.ReactElement {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [terms, setTerms] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [nameError, setNameError] = React.useState('');
  const [emailError, setEmailError] = React.useState('');
  const [pwError, setPwError] = React.useState('');
  const pwRef = React.useRef<HTMLInputElement | null>(null);

  function validate() {
    let valid = true;
    setNameError('');
    setEmailError('');
    setPwError('');

    if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters.');
      valid = false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    }
    if (password.length < 6) {
      setPwError('Password must be at least 6 characters.');
      valid = false;
    }
    if (!terms) {
      setPwError('You must agree to the Terms & Privacy Policy.');
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

    register({ name: name.trim(), email: email.trim(), password })
      .then(() => {
        navigate('/');
      })
      .catch((err) => {
        setLoading(false);
        setEmailError(err?.message || 'Registration failed. Email may already exist.');
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
          <p className="login-visual__subtitle">Join us and experience powerful admin tools at your fingertips.</p>
        </div>
      </div>

      <div className="login-form-side">
        <div className="login-card">
          <div className="login-card__brand">
            <div className="login-card__brand-icon">N</div>
            <span className="login-card__brand-name" data-site-name>{siteName}</span>
          </div>

          <h2 className="login-card__heading">Create Account</h2>
          <p className="login-card__sub">Sign up to get started with your admin dashboard.</p>

          <form id="registerForm" noValidate autoComplete="off" onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <div className="form-input-wrap">
                <span className="form-input-icon" dangerouslySetInnerHTML={{ __html: icons.user }} />
                <input id="name" className={`form-input ${nameError ? 'form-input--error' : ''}`} type="text" placeholder="Enter your full name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!nameError} aria-describedby={nameError ? 'nameError' : undefined} />
              </div>
              <div className={`form-error ${nameError ? 'visible' : ''}`} id="nameError">{nameError || 'Name must be at least 2 characters.'}</div>
            </div>

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
                <input id="password" ref={pwRef} className={`form-input ${pwError ? 'form-input--error' : ''}`} type="password" placeholder="••••••••" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!pwError} aria-describedby={pwError ? 'pwError' : undefined} />
                <button type="button" className="form-toggle-pw" id="togglePw" aria-label="Toggle password visibility" onClick={togglePw} dangerouslySetInnerHTML={{ __html: icons.eye }} />
              </div>
              <div className={`form-error ${pwError ? 'visible' : ''}`} id="pwError">{pwError || 'Password must be at least 6 characters.'}</div>
            </div>

            <div className="form-row">
              <label className="form-check">
                <input type="checkbox" id="terms" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
                I agree to the Terms & Privacy Policy
              </label>
            </div>

            <button type="submit" className={`btn-login ${loading ? 'loading' : ''}`} id="registerBtn" disabled={loading}>
              <span className="btn-text">Create Account</span>
              <span className="spinner" />
            </button>
          </form>

          <p className="login-footer">Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Sign in</a></p>
        </div>
      </div>
    </div>
  );
}

export function renderRegister(root: HTMLElement) {
  import('react-dom/client').then(({ createRoot }) => {
    root.innerHTML = '';
    const r = createRoot(root);
    r.render(React.createElement(RegisterComponent));
  });
}
