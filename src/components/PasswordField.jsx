import React, { useId, useState } from 'react';

/** An open eye, and an eye with a line through it. Decorative: the button carries the label. */
const EyeIcon = ({ off }) => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
    />
    <circle cx="12" cy="12" r="3" />
    {off && <path strokeLinecap="round" d="M4 20 20 4" />}
  </svg>
);

/**
 * A password input with a reveal toggle.
 *
 * Typing a password blind on a phone keyboard is the commonest reason a sign-in fails, so
 * every password field in the app gets the same eye. The toggle is a real button at 44px
 * with `aria-pressed`, not an icon glued to the corner, and it never submits the form.
 *
 * It deliberately does not remember the revealed state between fields or visits: a
 * password left on screen is a different problem from one that cannot be typed.
 */
function PasswordField({
  id, name, label, value, onChange, autoComplete, placeholder,
  required = false, disabled = false, hint = null
}) {
  const [shown, setShown] = useState(false);
  const generated = useId();
  const fieldId = id || `password-${generated}`;
  const hintId = hint ? `${fieldId}-hint` : undefined;

  return (
    <div>
      <label htmlFor={fieldId} className="label">{label}</label>
      <div className="relative">
        <input
          id={fieldId}
          name={name}
          type={shown ? 'text' : 'password'}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-describedby={hintId}
          // Room for the button, so a long password never runs underneath it
          className="input pr-12"
        />
        <button
          type="button"
          onClick={() => setShown(v => !v)}
          disabled={disabled}
          aria-pressed={shown}
          aria-controls={fieldId}
          aria-label={shown ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute inset-y-0 right-0 w-11 grid place-items-center text-slate-400 hover:text-slate-200 disabled:opacity-50"
        >
          <EyeIcon off={shown} />
        </button>
      </div>
      {hint && <p id={hintId} className="mt-1.5 text-sm text-slate-400">{hint}</p>}
    </div>
  );
}

export default PasswordField;
