import { User } from "@clerk/nextjs/server";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type SessionClaims = {
  azp: string;
  email: string;
  exp: number;
  firstName: string;
  fva: [number, number];
  iat: number;
  id: string;
  imageUrl: string;
  iss: string;
  jti: string;
  lastName: string;
  name: string;
  nbf: number;
  sid: string;
  sub: string;
};

interface StoreState {
  currentUser: SessionClaims | null;
  setCurrentUser: (user: SessionClaims) => void;
  clientFingerprint: string;
  setClientFingerprint: (fingerprint: string) => void;
}

const useStore = create<StoreState>()(
  devtools(
    (set) => ({
      currentUser: null,
      setCurrentUser: (user: Partial<User>) =>
        set({ currentUser: user as SessionClaims }, undefined, "setCurrentUser"),
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
