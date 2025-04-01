import { User } from "@clerk/nextjs/server";
import { create } from "zustand";

interface StoreState {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
}

const useStore = create<StoreState>((set) => ({
  currentUser: null,
  setCurrentUser: (user: User) => set({ currentUser: user }),
}));

export default useStore;
