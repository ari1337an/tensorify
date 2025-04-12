import { create } from 'zustand';

interface NewsletterSignupStore {
  isOpen: boolean;
  openNewsletterSignup: () => void;
  closeNewsletterSignup: () => void;
}

export const useNewsletterSignup = create<NewsletterSignupStore>((set) => ({
  isOpen: false,
  openNewsletterSignup: () => set({ isOpen: true }),
  closeNewsletterSignup: () => set({ isOpen: false }),
})); 