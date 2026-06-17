export type ThemeMode =
  | 'dark-midnight'
  | 'dark-slate'
  | 'dark-graphite'
  | 'dark-violet'
  | 'light-cloud'
  | 'light-paper'
  | 'light-mint'
  | 'light-rose';

export type AccentColor = 'indigo' | 'emerald' | 'sky' | 'rose' | 'amber' | 'violet';

export const THEME_OPTIONS: { id: ThemeMode; name: string; mode: 'dark' | 'light'; swatches: string[] }[] = [
  { id: 'dark-midnight', name: 'Midnight', mode: 'dark', swatches: ['#09090b', '#18181b', '#6366f1'] },
  { id: 'dark-slate', name: 'Slate', mode: 'dark', swatches: ['#0f172a', '#1e293b', '#38bdf8'] },
  { id: 'dark-graphite', name: 'Graphite', mode: 'dark', swatches: ['#111111', '#2a2a2a', '#f59e0b'] },
  { id: 'dark-violet', name: 'Violet', mode: 'dark', swatches: ['#181024', '#2e1d42', '#a855f7'] },
  { id: 'light-cloud', name: 'Cloud', mode: 'light', swatches: ['#f8fafc', '#ffffff', '#4f46e5'] },
  { id: 'light-paper', name: 'Paper', mode: 'light', swatches: ['#f7f3ea', '#fffaf0', '#d97706'] },
  { id: 'light-mint', name: 'Mint', mode: 'light', swatches: ['#f0fdfa', '#ffffff', '#059669'] },
  { id: 'light-rose', name: 'Rose', mode: 'light', swatches: ['#fff1f2', '#ffffff', '#e11d48'] },
];

export const ACCENT_OPTIONS: { id: AccentColor; name: string; value: string }[] = [
  { id: 'indigo', name: 'Indigo', value: '#6366f1' },
  { id: 'emerald', name: 'Emerald', value: '#10b981' },
  { id: 'sky', name: 'Sky', value: '#0ea5e9' },
  { id: 'rose', name: 'Rose', value: '#f43f5e' },
  { id: 'amber', name: 'Amber', value: '#f59e0b' },
  { id: 'violet', name: 'Violet', value: '#8b5cf6' },
];

export interface LocalUserProfile {
  id?: string;
  email: string;
  name: string;
  initials: string;
  title: string;
  company: string;
  phone: string;
  theme: ThemeMode;
  accentColor: AccentColor;
}

export const AUTH_USER_KEY = 'reachconvert_user';
export const ACCESS_TOKEN_KEY = 'reachconvert_access_token';
export const REFRESH_TOKEN_KEY = 'reachconvert_refresh_token';

export const DEFAULT_USER: LocalUserProfile = {
  email: '',
  name: '',
  initials: '',
  title: '',
  company: '',
  phone: '',
  theme: 'dark-midnight',
  accentColor: 'indigo',
};

function normalizeTheme(theme?: string): ThemeMode {
  if (theme === 'dark') return 'dark-midnight';
  if (theme === 'light') return 'light-cloud';
  return THEME_OPTIONS.some((option) => option.id === theme) ? (theme as ThemeMode) : DEFAULT_USER.theme;
}

function normalizeAccent(accent?: string): AccentColor {
  return ACCENT_OPTIONS.some((option) => option.id === accent) ? (accent as AccentColor) : DEFAULT_USER.accentColor;
}

function normalizeUser(user: Partial<LocalUserProfile>): LocalUserProfile {
  return {
    ...DEFAULT_USER,
    ...user,
    theme: normalizeTheme(user.theme),
    accentColor: normalizeAccent(user.accentColor),
  };
}

export function getThemeFamily(theme: ThemeMode) {
  return THEME_OPTIONS.find((option) => option.id === theme)?.mode || 'dark';
}

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
    const user = normalizeUser(JSON.parse(stored));
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return user;
  } catch {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(DEFAULT_USER));
    return DEFAULT_USER;
  }
}

export function saveStoredUser(user: LocalUserProfile) {
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(normalizeUser(user)));
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

export function applyTheme(theme: ThemeMode, accentColor: AccentColor = DEFAULT_USER.accentColor) {
  const normalizedTheme = normalizeTheme(theme);
  const normalizedAccent = normalizeAccent(accentColor);
  const family = getThemeFamily(normalizedTheme);

  document.documentElement.classList.toggle('dark', family === 'dark');
  document.documentElement.classList.toggle('light', family === 'light');
  document.body.classList.toggle('theme-light', family === 'light');
  document.body.dataset.theme = normalizedTheme;
  document.body.dataset.accent = normalizedAccent;
}
