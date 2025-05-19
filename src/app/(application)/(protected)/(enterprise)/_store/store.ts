import { User } from "@clerk/nextjs/server";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface StoreState {
  currentUser: User | null;
  setCurrentUser: (user: Partial<User>) => void;
}

const useStore = create<StoreState>()(
  devtools( 
    (set) => ({
      currentUser: null,
      setCurrentUser: (user: Partial<User>) =>
        set({ currentUser: user as User }, undefined, "setCurrentUser"),
    }),
    { name: "EnterpriseStore" }
  )
);

export default useStore;
