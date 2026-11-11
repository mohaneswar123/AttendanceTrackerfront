import React from 'react';
import { Link } from 'react-router-dom';
import { FEATURES, toneOf } from '../features/registry';
import { APP_NAME, APP_INITIAL } from '../branding';

/** One line per module, so the list says what the app is rather than naming it */
const WHAT_IT_DOES = {
  attendance: 'How many hours you can still miss',
  tasks: 'Today’s work, and what slipped',
  habits: 'Streaks, without the nagging',
  calendar: 'Everything with a date on it',
  timetable: 'Today’s classes, in order',
  focus: 'A timer that survives closing the app'
};

/**
 * What a guest sees.
 *
 * This used to be one card with a Sign in and a Create account button on an otherwise
 * empty screen, which asked people to make an account for something they had not been
 * shown. The six modules are listed from the registry, so the preview cannot drift out of
 * step with what the app actually has.
 */
function LoginPrompt({ title, message }) {
  return (
    <div className="max-w-md mx-auto pb-6 space-y-5">
      {/* Returning students sign in far more often than anyone signs up, and on a 812px
          screen the buttons under the preview sit past the fold. The quick way in goes
          first, where no scrolling is needed to find it. */}
      <div className="flex justify-end">
        <Link to="/login" className="h-11 px-2 -mr-2 inline-flex items-center font-semibold text-primary-400 hover:text-primary-300">
          Sign in
        </Link>
      </div>

      <header className="text-center">
        <span className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary-600 text-primary-foreground text-lg font-bold flex items-center justify-center">
          {APP_INITIAL}
        </span>
        <h1 className="text-[28px] leading-[1.15] font-bold tracking-tight text-white">
          {title || APP_NAME}
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          {message || `Six things a student actually has to keep track of, in one app.`}
        </p>
      </header>

      <ul className="space-y-2" aria-label={`What ${APP_NAME} does`}>
        {FEATURES.map(feature => {
          const tone = toneOf(feature.id);
          return (
            <li key={feature.id} className={`rounded-xl p-3 flex items-center gap-3 ${tone.tint}`}>
              <span className={`w-9 h-9 shrink-0 rounded-xl grid place-items-center bg-background-paper ${tone.text}`}>
                <feature.Icon className="w-[18px] h-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block font-bold text-white truncate">{feature.name}</span>
                <span className="block text-sm text-slate-400 truncate">
                  {WHAT_IT_DOES[feature.id]}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      <div className="space-y-2">
        <Link to="/register" className="btn btn-primary w-full h-12">Create an account</Link>
        <Link to="/login" className="btn btn-secondary w-full h-12">I already have one</Link>
        <p className="text-sm text-slate-400 text-center pt-1">
          Free, and your data stays yours.
        </p>
      </div>
    </div>
  );
}

export default LoginPrompt;
