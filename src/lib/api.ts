const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function handleResponse(res: Response) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || res.statusText || 'An error occurred while fetching the API');
  }
  return res.json();
}

export const api = {
  // Settings
  settings: {
    get: () => fetch(`${BASE_URL}/settings`).then(handleResponse),
    update: (data: any) =>
      fetch(`${BASE_URL}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),
    testSes: () => fetch(`${BASE_URL}/settings/test-ses`, { method: 'POST' }).then(handleResponse),
    testOpenRouter: () => fetch(`${BASE_URL}/settings/test-openrouter`, { method: 'POST' }).then(handleResponse),
  },

  // Contacts
  contacts: {
    list: () => fetch(`${BASE_URL}/contacts`).then(handleResponse),
    get: (id: string) => fetch(`${BASE_URL}/contacts/${id}`).then(handleResponse),
    create: (data: any) =>
      fetch(`${BASE_URL}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),
    update: (id: string, data: any) =>
      fetch(`${BASE_URL}/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),
    delete: (id: string) => fetch(`${BASE_URL}/contacts/${id}`, { method: 'DELETE' }).then(handleResponse),
    parseFile: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return fetch(`${BASE_URL}/contacts/parse-file`, {
        method: 'POST',
        body: formData,
      }).then(handleResponse);
    },
    import: (data: any) =>
      fetch(`${BASE_URL}/contacts/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),
  },

  // Templates
  templates: {
    list: () => fetch(`${BASE_URL}/templates`).then(handleResponse),
    predefined: () => fetch(`${BASE_URL}/templates/predefined`).then(handleResponse),
    get: (id: string) => fetch(`${BASE_URL}/templates/${id}`).then(handleResponse),
    create: (data: any) =>
      fetch(`${BASE_URL}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),
    update: (id: string, data: any) =>
      fetch(`${BASE_URL}/templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),
    delete: (id: string) => fetch(`${BASE_URL}/templates/${id}`, { method: 'DELETE' }).then(handleResponse),
    generate: (data: { goal: string; audience: string; tone: string; instructions?: string }) =>
      fetch(`${BASE_URL}/templates/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),
  },

  // Email Campaigns
  emailCampaigns: {
    list: () => fetch(`${BASE_URL}/email-campaigns`).then(handleResponse),
    get: (id: string) => fetch(`${BASE_URL}/email-campaigns/${id}`).then(handleResponse),
    create: (data: any) =>
      fetch(`${BASE_URL}/email-campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),
    update: (id: string, data: any) =>
      fetch(`${BASE_URL}/email-campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),
    delete: (id: string) => fetch(`${BASE_URL}/email-campaigns/${id}`, { method: 'DELETE' }).then(handleResponse),
    addContacts: (id: string, contactIds: string[]) =>
      fetch(`${BASE_URL}/email-campaigns/${id}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactIds }),
      }).then(handleResponse),
    removeContact: (id: string, contactId: string) =>
      fetch(`${BASE_URL}/email-campaigns/${id}/contacts/${contactId}`, {
        method: 'DELETE',
      }).then(handleResponse),
    launch: (id: string) => fetch(`${BASE_URL}/email-campaigns/${id}/launch`, { method: 'POST' }).then(handleResponse),
  },

  // Calling Campaigns
  callingCampaigns: {
    dashboard: () => fetch(`${BASE_URL}/calling-campaigns/dashboard`).then(handleResponse),
    list: () => fetch(`${BASE_URL}/calling-campaigns`).then(handleResponse),
    get: (id: string) => fetch(`${BASE_URL}/calling-campaigns/${id}`).then(handleResponse),
    create: (data: any) =>
      fetch(`${BASE_URL}/calling-campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),
    update: (id: string, data: any) =>
      fetch(`${BASE_URL}/calling-campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),
    delete: (id: string) => fetch(`${BASE_URL}/calling-campaigns/${id}`, { method: 'DELETE' }).then(handleResponse),
    launch: (id: string) => fetch(`${BASE_URL}/calling-campaigns/${id}/launch`, { method: 'POST' }).then(handleResponse),
  },

  // History
  history: {
    emails: (params: { startDate?: string; endDate?: string; campaignId?: string; status?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return fetch(`${BASE_URL}/history/emails?${query}`).then(handleResponse);
    },
    calls: (params: { startDate?: string; endDate?: string; campaignId?: string; outcome?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return fetch(`${BASE_URL}/history/calls?${query}`).then(handleResponse);
    },
  },

  // Analytics
  analytics: {
    get: () => fetch(`${BASE_URL}/analytics`).then(handleResponse),
  },
};
