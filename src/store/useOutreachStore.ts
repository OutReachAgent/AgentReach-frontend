import { create } from 'zustand';

interface AlertState {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface OutreachState {
  selectedContactIds: string[];
  setSelectedContactIds: (ids: string[]) => void;
  toggleContactSelection: (id: string) => void;
  clearContactSelection: () => void;
  
  // Campaign Wizard state
  wizardCampaignName: string;
  setWizardCampaignName: (name: string) => void;
  wizardTemplateId: string | null;
  setWizardTemplateId: (id: string | null) => void;
  wizardContactIds: string[];
  setWizardContactIds: (ids: string[]) => void;
  wizardStep: number;
  setWizardStep: (step: number) => void;
  resetWizard: () => void;

  // Alerts
  alert: AlertState | null;
  setAlert: (alert: AlertState | null) => void;
  showAlert: (message: string, type: 'success' | 'error' | 'info', title?: string) => void;
  clearAlert: () => void;
}

const defaultTitles = {
  success: 'Done',
  error: 'Please check this',
  info: 'Update',
};

function makeFriendlyMessage(message: string, type: 'success' | 'error' | 'info') {
  const text = message || '';
  const lower = text.toLowerCase();

  if (lower.includes('cannot connect') || lower.includes('backend') || lower.includes('nestjs') || lower.includes('failed to fetch')) {
    return 'We could not reach the app server. Please try again in a moment.';
  }

  if (lower.includes('timed out') || lower.includes('timeout')) {
    return 'This is taking longer than expected. Please try again.';
  }

  if (lower.includes('unauthorized') || lower.includes('token') || lower.includes('session')) {
    return 'Your session has expired. Please log in again.';
  }

  if (lower.includes('network') || lower.includes('socket') || lower.includes('operation not permitted')) {
    return 'There was a connection problem. Please check your internet and try again.';
  }

  if (lower.includes('validation') || lower.includes('bad request')) {
    return 'Some information looks incorrect. Please review the form and try again.';
  }

  if (lower.includes('aws') || lower.includes('ses')) {
    return 'Email sending is not ready yet. Please check your email settings and try again.';
  }

  if (lower.includes('openrouter') || lower.includes('ai generation')) {
    return 'AI template generation could not finish. Please check your AI settings or try again.';
  }

  if (lower.startsWith('failed to ') || lower.startsWith('error ')) {
    return type === 'error' ? 'Something went wrong. Please try again.' : text;
  }

  return text;
}

export const useOutreachStore = create<OutreachState>((set) => ({
  selectedContactIds: [],
  setSelectedContactIds: (ids) => set({ selectedContactIds: ids }),
  toggleContactSelection: (id) =>
    set((state) => ({
      selectedContactIds: state.selectedContactIds.includes(id)
        ? state.selectedContactIds.filter((cid) => cid !== id)
        : [...state.selectedContactIds, id],
    })),
  clearContactSelection: () => set({ selectedContactIds: [] }),

  // Campaign Wizard
  wizardCampaignName: '',
  setWizardCampaignName: (name) => set({ wizardCampaignName: name }),
  wizardTemplateId: null,
  setWizardTemplateId: (id) => set({ wizardTemplateId: id }),
  wizardContactIds: [],
  setWizardContactIds: (ids) => set({ wizardContactIds: ids }),
  wizardStep: 1,
  setWizardStep: (step) => set({ wizardStep: step }),
  resetWizard: () =>
    set({
      wizardCampaignName: '',
      wizardTemplateId: null,
      wizardContactIds: [],
      wizardStep: 1,
    }),

  // Alerts
  alert: null,
  setAlert: (alert) => set({ alert }),
  showAlert: (message, type, title) => {
    set({
      alert: {
        title: title || defaultTitles[type],
        message: makeFriendlyMessage(message, type),
        type,
      },
    });
    setTimeout(() => {
      set({ alert: null });
    }, type === 'error' ? 6500 : 4500);
  },
  clearAlert: () => set({ alert: null }),
}));
