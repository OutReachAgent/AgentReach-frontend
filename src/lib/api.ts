import { getAccessToken, getRefreshToken, saveAuthSession, saveTokens, signOut } from './localAuth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const REQUEST_TIMEOUT_MS = 8000;
const AI_REQUEST_TIMEOUT_MS = 45000;

async function handleResponse(res: Response) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(toFriendlyApiError(errorData.message || res.statusText, res.status));
  }
  return res.json();
}

function toFriendlyApiError(message: unknown, status: number) {
  const text = Array.isArray(message) ? message.join(' ') : String(message || '');
  const lower = text.toLowerCase();

  if (status === 401) return 'Your session has expired. Please log in again.';
  if (status === 403) return 'You do not have permission to do that.';
  if (status === 404) return 'We could not find that item. It may have been removed.';
  if (status >= 500) return 'The server had a problem. Please try again in a moment.';
  if (lower.includes('duplicate') || lower.includes('already exists')) return 'This item already exists.';
  if (lower.includes('missing') || lower.includes('required')) return 'Please fill in the required information.';
  if (lower.includes('invalid')) return 'Some information looks incorrect. Please check it and try again.';
  if (lower.includes('no pending contacts')) return 'Everyone in this campaign has already been sent. Use Launch Again to send it again.';
  if (lower.includes('no contacts')) return 'Please add recipients before launching this campaign.';
  if (lower.includes('template')) return 'Please choose or create an email template first.';

  return text || 'Something went wrong. Please try again.';
}

async function request(path: string, init?: RequestInit, timeoutMs = REQUEST_TIMEOUT_MS) {
  return requestWithAuth(path, init, timeoutMs, true);
}

async function requestWithAuth(path: string, init?: RequestInit, timeoutMs = REQUEST_TIMEOUT_MS, allowRefresh = true) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers = new Headers(init?.headers);
    const accessToken = getAccessToken();

    if (accessToken && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    });

    if (response.status === 401 && allowRefresh && path !== '/auth/refresh') {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return requestWithAuth(path, init, timeoutMs, false);
      }
    }

    return handleResponse(response);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('This is taking longer than expected. Please try again.');
    }

    if (error instanceof TypeError) {
      throw new Error('We could not reach the app server. Please try again in a moment.');
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      signOut();
      return false;
    }

    const session = await response.json();
    saveAuthSession(session);
    saveTokens(session.accessToken, session.refreshToken);
    return true;
  } catch {
    signOut();
    return false;
  }
}

export const api = {
  auth: {
    login: (data: { email: string; password: string }) =>
      request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    refresh: (refreshToken: string) =>
      request('/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }),
    me: () => request('/auth/me'),
    updateProfile: (data: any) =>
      request('/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    resetPassword: (data: { email: string; newPassword: string }) =>
      request('/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    logout: () => request('/auth/logout', { method: 'POST' }),
  },

  // Settings
  settings: {
    get: () => request('/settings'),
    update: (data: any) =>
      request('/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    testSes: () => request('/settings/test-ses', { method: 'POST' }),
    testOpenRouter: () => request('/settings/test-openrouter', { method: 'POST' }),
  },

  // Contacts
  contacts: {
    list: () => request('/contacts'),
    directories: {
      list: () => request('/contacts/directories'),
      create: (data: any) =>
        request('/contacts/directories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),
      update: (id: string, data: any) =>
        request(`/contacts/directories/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),
      delete: (id: string) => request(`/contacts/directories/${id}`, { method: 'DELETE' }),
    },
    get: (id: string) => request(`/contacts/${id}`),
    create: (data: any) =>
      request('/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request(`/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    delete: (id: string) => request(`/contacts/${id}`, { method: 'DELETE' }),
    parseFile: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return request('/contacts/parse-file', {
        method: 'POST',
        body: formData,
      });
    },
    import: (data: any) =>
      request('/contacts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
  },

  // Templates
  templates: {
    list: () => request('/templates'),
    predefined: () => request('/templates/predefined'),
    get: (id: string) => request(`/templates/${id}`),
    create: (data: any) =>
      request('/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request(`/templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    delete: (id: string) => request(`/templates/${id}`, { method: 'DELETE' }),
    generate: (data: { goal: string; audience: string; tone: string; instructions?: string; format?: 'HTML' | 'TEXT' }) =>
      request('/templates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }, AI_REQUEST_TIMEOUT_MS),
  },

  // Email Campaigns
  emailCampaigns: {
    list: () => request('/email-campaigns'),
    get: (id: string) => request(`/email-campaigns/${id}`),
    create: (data: any) =>
      request('/email-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request(`/email-campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    delete: (id: string) => request(`/email-campaigns/${id}`, { method: 'DELETE' }),
    addContacts: (id: string, contactIds: string[]) =>
      request(`/email-campaigns/${id}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactIds }),
      }),
    removeContact: (id: string, contactId: string) =>
      request(`/email-campaigns/${id}/contacts/${contactId}`, {
        method: 'DELETE',
      }),
    launch: (id: string) => request(`/email-campaigns/${id}/launch`, { method: 'POST' }),
  },

  // Calling Campaigns
  callingCampaigns: {
    dashboard: () => request('/calling-campaigns/dashboard'),
    list: () => request('/calling-campaigns'),
    get: (id: string) => request(`/calling-campaigns/${id}`),
    create: (data: any) =>
      request('/calling-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request(`/calling-campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    delete: (id: string) => request(`/calling-campaigns/${id}`, { method: 'DELETE' }),
    launch: (id: string) => request(`/calling-campaigns/${id}/launch`, { method: 'POST' }),
  },

  // History
  history: {
    emails: (params: { startDate?: string; endDate?: string; campaignId?: string; status?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request(`/history/emails?${query}`);
    },
    calls: (params: { startDate?: string; endDate?: string; campaignId?: string; outcome?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request(`/history/calls?${query}`);
    },
  },

  // Analytics
  analytics: {
    get: () => request('/analytics'),
  },
};
