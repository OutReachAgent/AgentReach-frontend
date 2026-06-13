export type ThemeMode = 'dark' | 'light';

export interface LocalUserProfile {
  id?: string;
  email: string;
  name: string;
  initials: string;
  title: string;
  company: string;
  phone: string;
  theme: ThemeMode;
}

export const AUTH_USER_KEY = 'reachconvert_user';
export const ACCESS_TOKEN_KEY = 'reachconvert_access_token';
export const REFRESH_TOKEN_KEY = 'reachconvert_refresh_token';

export const DEFAULT_USER: LocalUserProfile = {
  email: 'oswinalex1@gmail.com',
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
  return typeof window !== 'undefined' && !!getAccessToken() && !!getRefreshToken();
}

export function saveAuthSession(tokens: { accessToken: string; refreshToken: string; user: LocalUserProfile }) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  saveStoredUser(tokens.user);
}

export function signOut() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getAccessToken() {
  return typeof window === 'undefined' ? null : window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return typeof window === 'undefined' ? null : window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveTokens(accessToken: string, refreshToken: string) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function applyTheme(theme: ThemeMode) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.classList.toggle('light', theme === 'light');
  document.body.classList.toggle('theme-light', theme === 'light');
}
