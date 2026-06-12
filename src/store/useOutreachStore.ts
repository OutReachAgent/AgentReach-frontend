import { create } from 'zustand';

interface AlertState {
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
  showAlert: (message: string, type: 'success' | 'error' | 'info') => void;
  clearAlert: () => void;
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
  showAlert: (message, type) => {
    set({ alert: { message, type } });
    setTimeout(() => {
      set({ alert: null });
    }, 4000);
  },
  clearAlert: () => set({ alert: null }),
}));
