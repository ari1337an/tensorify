import { User } from "@clerk/nextjs/server";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface StoreState {
  currentUser: User | null;
  setCurrentUser: (user: Partial<User>) => void;
  clientFingerprint: string;
  setClientFingerprint: (fingerprint: string) => void;
}

const useStore = create<StoreState>()(
  devtools(
    (set) => ({
      currentUser: null,
      setCurrentUser: (user: Partial<User>) =>
        set({ currentUser: user as User }, undefined, "setCurrentUser"),
      clientFingerprint: "",
      setClientFingerprint: (fingerprint: string) =>
        set(
          { clientFingerprint: fingerprint },
          undefined,
          "setClientFingerprint"
        ),
    }),
    { name: "AppStore" }
  )
);

export default useStore;
