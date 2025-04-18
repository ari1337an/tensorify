import { create } from 'zustand';

type Role = 'student' | 'researcher' | 'developer' | 'other';

interface NewsletterSignupForm {
  email: string;
  role: Role;
  otherRole: string;
  consentGiven: boolean;
}

interface NewsletterSignupStore {
  isOpen: boolean;
  form: NewsletterSignupForm;
  status: 'idle' | 'loading' | 'success' | 'error';
  errorMessage: string;
  
  // Modal actions
  openNewsletterSignup: () => void;
  closeNewsletterSignup: () => void;
  
  // Form actions
  updateEmail: (email: string) => void;
  updateRole: (role: Role) => void;
  updateOtherRole: (otherRole: string) => void;
  updateConsent: (consentGiven: boolean) => void;
  resetForm: () => void;
  
  // Submission actions
  setStatus: (status: 'idle' | 'loading' | 'success' | 'error') => void;
  setErrorMessage: (message: string) => void;
}

const defaultForm: NewsletterSignupForm = {
  email: '',
  role: 'developer',
  otherRole: '',
  consentGiven: false,
};

export const useNewsletterSignup = create<NewsletterSignupStore>((set) => ({
  isOpen: false,
  form: { ...defaultForm },
  status: 'idle',
  errorMessage: '',
  
  // Modal actions
  openNewsletterSignup: () => set({ isOpen: true }),
  closeNewsletterSignup: () => set({ isOpen: false }),
  
  // Form actions
  updateEmail: (email) => set((state) => ({ 
    form: { ...state.form, email } 
  })),
  updateRole: (role) => set((state) => ({ 
    form: { ...state.form, role } 
  })),
  updateOtherRole: (otherRole) => set((state) => ({ 
    form: { ...state.form, otherRole } 
  })),
  updateConsent: (consentGiven) => set((state) => ({ 
    form: { ...state.form, consentGiven } 
  })),
  resetForm: () => set({ 
    form: { ...defaultForm },
    status: 'idle',
    errorMessage: ''
  }),
  
  // Submission actions
  setStatus: (status) => set({ status }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
})); 