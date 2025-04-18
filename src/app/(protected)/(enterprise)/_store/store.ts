import { User } from "@clerk/nextjs/server";
import { create } from "zustand";

interface StoreState {
  currentUser: User | null;
  setCurrentUser: (user: Partial<User>) => void;
  currentRoute: string;
  setCurrentRoute: (route: string) => void;
}

const useStore = create<StoreState>((set) => ({
  currentUser: null,
  setCurrentUser: (user: Partial<User>) => set({ currentUser: user as User }),
  currentRoute: "",
  setCurrentRoute: (route: string) => set({ currentRoute: route }),
}));

export default useStore;
