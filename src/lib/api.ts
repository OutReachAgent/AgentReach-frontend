const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const REQUEST_TIMEOUT_MS = 8000;
const AI_REQUEST_TIMEOUT_MS = 45000;

async function handleResponse(res: Response) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || res.statusText || 'An error occurred while fetching the API');
  }
  return res.json();
}

async function request(path: string, init?: RequestInit, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
    });
    return handleResponse(response);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`API request timed out. Check that the backend is running at ${BASE_URL}.`);
    }

    if (error instanceof TypeError) {
      throw new Error(`Cannot connect to backend at ${BASE_URL}. Make sure the NestJS server is running.`);
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export const api = {
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
