export type ThemeMode = 'dark' | 'light';

export interface LocalUserProfile {
  email: string;
  password: string;
  name: string;
  initials: string;
  title: string;
  company: string;
  phone: string;
  theme: ThemeMode;
}

export const AUTH_USER_KEY = 'reachconvert_user';
export const AUTH_SESSION_KEY = 'reachconvert_session';

export const DEFAULT_USER: LocalUserProfile = {
  email: 'oswinalex1@gmail.com',
  password: 'DBIT@2026',
  name: 'Oswin Alex',
  initials: 'OA',
  title: 'Founder',
  company: 'ReachConvert',
  phone: '',
  theme: 'dark',
};

export function getStoredUser(): LocalUserProfile {
  if (typeof window === 'undefined') {
    return DEFAULT_USER;
  }

  const stored = window.localStorage.getItem(AUTH_USER_KEY);
  if (!stored) {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(DEFAULT_USER));
    return DEFAULT_USER;
  }

  try {
    return { ...DEFAULT_USER, ...JSON.parse(stored) };
  } catch {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(DEFAULT_USER));
    return DEFAULT_USER;
  }
}

export function saveStoredUser(user: LocalUserProfile) {
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('reachconvert:user-updated'));
}

export function isAuthenticated() {
  return typeof window !== 'undefined' && window.localStorage.getItem(AUTH_SESSION_KEY) === 'true';
}

export function signIn() {
  window.localStorage.setItem(AUTH_SESSION_KEY, 'true');
}

export function signOut() {
  window.localStorage.removeItem(AUTH_SESSION_KEY);
}

export function applyTheme(theme: ThemeMode) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.classList.toggle('light', theme === 'light');
  document.body.classList.toggle('theme-light', theme === 'light');
}
