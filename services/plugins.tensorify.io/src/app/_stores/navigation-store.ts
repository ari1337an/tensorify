import { create } from "zustand";

interface NavigationStore {
  isLoading: boolean;
  progress: number;
  startLoading: () => void;
  setProgress: (progress: number) => void;
  completeLoading: () => void;
  stopLoading: () => void;
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  isLoading: false,
  progress: 0,
  startLoading: () => set({ isLoading: true, progress: 0 }),
  setProgress: (progress) => set({ progress }),
  completeLoading: () => set({ progress: 100 }),
  stopLoading: () => set({ isLoading: false, progress: 0 }),
})); 