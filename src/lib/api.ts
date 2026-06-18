import {
  getAccessToken,
  getRefreshToken,
  saveAuthSession,
  saveTokens,
  signOut,
} from "./localAuth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const REQUEST_TIMEOUT_MS = 8000;
const AI_REQUEST_TIMEOUT_MS = 45000;

type ApiPayload = { [key: string]: unknown };
export type LooseApiResponse = ReturnType<typeof JSON.parse>;
type AuthProfileUpdate = {
  name?: string;
  email?: string;
  theme?: string;
  accentColor?: string;
};
type SettingsUpdate = {
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsRegion?: string;
  openRouterApiKey?: string;
  openRouterModel?: string;
  awsSenderEmail?: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
  geminiApiKey?: string;
  twilioStatus?: string;
  geminiStatus?: string;
};
type GeminiVoicePreviewPayload = {
  voice: string;
  language?: string;
  text?: string;
};
type CampaignPayload = {
  [key: string]: unknown;
  name?: string;
  templateId?: string;
  status?: string;
  cc?: string[]; // CC email addresses
  bcc?: string[]; // BCC email addresses
};

type DirectoryPayload = {
  name?: string;
  description?: string;
};
type ContactPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  company?: string;
  jobTitle?: string;
  linkedinUrl?: string;
  notes?: string;
  directoryId?: string | null;
  customFields?: Record<string, string>;
};
type ContactImportPayload = ApiPayload;
type TemplatePayload = {
  [key: string]: unknown;
  name?: string;
  subject?: string;
  bodyHtml?: string;
  bodyText?: string;
};

type HistoryParams = Record<string, string | undefined>;

async function handleResponse<T = LooseApiResponse>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch((): ApiPayload => ({}));
    throw new Error(
      toFriendlyApiError(errorData.message || res.statusText, res.status),
    );
  }
  return res.json() as Promise<T>;
}

function toFriendlyApiError(message: unknown, status: number) {
  const text = Array.isArray(message)
    ? message.join(" ")
    : String(message || "");
  const lower = text.toLowerCase();

  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403) return "You do not have permission to do that.";
  if (status === 404)
    return "We could not find that item. It may have been removed.";
  if (status >= 500)
    return "The server had a problem. Please try again in a moment.";
  if (lower.includes("duplicate") || lower.includes("already exists"))
    return "This item already exists.";
  if (lower.includes("missing") || lower.includes("required"))
    return "Please fill in the required information.";
  if (lower.includes("invalid"))
    return "Some information looks incorrect. Please check it and try again.";
  if (lower.includes("no pending contacts"))
    return "Everyone in this campaign has already been sent. Use Launch Again to send it again.";
  if (lower.includes("no pending calls"))
    return "Please add contacts before launching this calling campaign.";
  if (lower.includes("no contacts with phone numbers"))
    return "Add at least one contact with a phone number before launching this calling campaign.";
  if (lower.includes("no contacts"))
    return "Please add recipients before launching this campaign.";
  if (lower.includes("template"))
    return "Please choose or create an email template first.";

  return text || "Something went wrong. Please try again.";
}

async function request<T = LooseApiResponse>(
  path: string,
  init?: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS,
) {
  return requestWithAuth<T>(path, init, timeoutMs, true);
}

async function requestWithAuth<T = LooseApiResponse>(
  path: string,
  init?: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS,
  allowRefresh = true,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers = new Headers(init?.headers);
    const accessToken = getAccessToken();

    if (accessToken && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    const response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    });

    if (response.status === 401 && allowRefresh && path !== "/auth/refresh") {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return requestWithAuth<T>(path, init, timeoutMs, false);
      }
    }

    return handleResponse<T>(response);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("This is taking longer than expected. Please try again.");
    }

    if (error instanceof TypeError) {
      throw new Error(
        "We could not reach the app server. Please try again in a moment.",
      );
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
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

function toQueryString(params: HistoryParams) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  return query.toString();
}

export const api = {
  auth: {
    login: (data: { email: string; password: string }) =>
      request("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    refresh: (refreshToken: string) =>
      request("/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      }),
    me: () => request("/auth/me"),
    updateProfile: (data: AuthProfileUpdate) =>
      request("/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    resetPassword: (data: { email: string; newPassword: string }) =>
      request("/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    logout: () => request("/auth/logout", { method: "POST" }),
  },

  // Settings
  settings: {
    get: () => request("/settings"),
    update: (data: SettingsUpdate) =>
      request("/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    testSes: () => request("/settings/test-ses", { method: "POST" }),
    testOpenRouter: () =>
      request("/settings/test-openrouter", { method: "POST" }),
    testTwilio: () => request("/settings/test-twilio", { method: "POST" }),
    testGemini: () => request("/settings/test-gemini", { method: "POST" }),
    previewGeminiVoice: (data: GeminiVoicePreviewPayload) =>
      request(
        "/settings/preview-gemini-voice",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
        AI_REQUEST_TIMEOUT_MS,
      ),
  },

  // Contacts
  contacts: {
    list: () => request("/contacts"),
    directories: {
      list: () => request("/contacts/directories"),
      create: (data: DirectoryPayload) =>
        request("/contacts/directories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }),
      update: (id: string, data: DirectoryPayload) =>
        request(`/contacts/directories/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }),
      delete: (id: string) =>
        request(`/contacts/directories/${id}`, { method: "DELETE" }),
    },
    get: (id: string) => request(`/contacts/${id}`),
    create: (data: ContactPayload) =>
      request("/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    update: (id: string, data: ContactPayload) =>
      request(`/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    delete: (id: string) => request(`/contacts/${id}`, { method: "DELETE" }),
    parseFile: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return request("/contacts/parse-file", {
        method: "POST",
        body: formData,
      });
    },
    import: (data: ContactImportPayload) =>
      request("/contacts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
  },

  // Profile - resume upload
  profile: {
    uploadResume: (file: File) => {
      const formData = new FormData();
      formData.append("resume", file);
      return request("/profile/upload-resume", {
        method: "POST",
        body: formData,
      });
    },
  },

  // Templates
  templates: {
    list: () => request("/templates"),
    predefined: () => request("/templates/predefined"),
    get: (id: string) => request(`/templates/${id}`),
    create: (data: TemplatePayload) =>
      request("/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    update: (id: string, data: TemplatePayload) =>
      request(`/templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    delete: (id: string) => request(`/templates/${id}`, { method: "DELETE" }),
    parseReferencePdf: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return request("/templates/reference-pdf", {
        method: "POST",
        body: formData,
      });
    },
    generate: (data: {
      goal: string;
      audience: string;
      tone: string;
      instructions?: string;
      referenceDocumentText?: string;
      referenceDocumentName?: string;
      format?: "HTML" | "TEXT";
    }) =>
      request(
        "/templates/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
        AI_REQUEST_TIMEOUT_MS,
      ),
    startGenerate: (data: {
      goal: string;
      audience: string;
      tone: string;
      instructions?: string;
      referenceDocumentText?: string;
      referenceDocumentName?: string;
      format?: "HTML" | "TEXT";
    }) =>
      request("/templates/generate-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    generationStatus: (id: string) => request(`/templates/generate-jobs/${id}`),
  },

  // Email Campaigns
  emailCampaigns: {
    list: () => request("/email-campaigns"),
    get: (id: string) => request(`/email-campaigns/${id}`),
    create: (data: CampaignPayload) =>
      request("/email-campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    update: (id: string, data: CampaignPayload) =>
      request(`/email-campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request(`/email-campaigns/${id}`, { method: "DELETE" }),
    addContacts: (id: string, contactIds: string[]) =>
      request(`/email-campaigns/${id}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactIds }),
      }),
    removeContact: (id: string, contactId: string) =>
      request(`/email-campaigns/${id}/contacts/${contactId}`, {
        method: "DELETE",
      }),
    launch: (id: string) =>
      request(`/email-campaigns/${id}/launch`, { method: "POST" }),
  },

  // Calling Campaigns
  callingCampaigns: {
    dashboard: () => request("/calling-campaigns/dashboard"),
    list: () => request("/calling-campaigns"),
    get: (id: string) => request(`/calling-campaigns/${id}`),
    create: (data: CampaignPayload) =>
      request("/calling-campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    update: (id: string, data: CampaignPayload) =>
      request(`/calling-campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request(`/calling-campaigns/${id}`, { method: "DELETE" }),
    launch: (id: string) =>
      request(`/calling-campaigns/${id}/launch`, { method: "POST" }),
  },

  // History
  history: {
    emails: (params: {
      startDate?: string;
      endDate?: string;
      campaignId?: string;
      status?: string;
    }) => {
      const query = toQueryString(params);
      return request(`/history/emails?${query}`);
    },
    calls: (params: {
      startDate?: string;
      endDate?: string;
      campaignId?: string;
      outcome?: string;
    }) => {
      const query = toQueryString(params);
      return request(`/history/calls?${query}`);
    },
    replies: (emailId: string) => request(`/history/replies/${emailId}`),
  },

  // Analytics
  analytics: {
    get: () => request("/analytics"),
  },
};
