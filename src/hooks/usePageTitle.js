import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { featureForPath } from '../features/registry';
import { APP_NAME, pageTitle } from '../branding';

/** Routes that are not features but still deserve their own name in the tab */
const NAMED = {
  '/settings': 'Settings',
  '/login': 'Sign in',
  '/register': 'Create an account',
  '/privacy-policy': 'Privacy',
  '/terms': 'Terms',
  '/about-us': 'About',
  '/contact-us': 'Contact',
  '/admin/login': 'Admin',
  '/admin/dashboard': 'Admin'
};

/**
 * Names the browser tab after the page you are actually on.
 *
 * Every route used to say "Attendance In Hand – Simple Attendance Tracking", including
 * Tasks, Habits and Focus, which made a row of pinned tabs useless and described a third
 * of what the app does. Inside a feature the section is the name, because that is what
 * someone is looking for when they scan their tabs: "History · Momentum", not "Attendance".
 */
export default function usePageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const { feature, tab } = featureForPath(pathname);
    const name = feature
      ? `${tab?.label ?? feature.name} · ${feature.name}`
      : NAMED[pathname];
    document.title = pathname === '/' ? `${APP_NAME} — for students` : pageTitle(name);
  }, [pathname]);
}
