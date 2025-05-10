import { User } from "@clerk/nextjs/server";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Organization } from "@prisma/client";

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
  currentOrg: Organization | null;
  setCurrentOrg: (org: Organization) => void;
}

const useStore = create<StoreState>()(
  devtools(
    (set) => ({
      currentUser: null,
      setCurrentUser: (user: Partial<User>) =>
        set(
          { currentUser: user as SessionClaims },
          undefined,
          "setCurrentUser"
        ),
      clientFingerprint: "",
      setClientFingerprint: (fingerprint: string) =>
        set(
          { clientFingerprint: fingerprint },
          undefined,
          "setClientFingerprint"
        ),
      currentOrg: null,
      setCurrentOrg: (org: Organization) =>
        set({ currentOrg: org }, undefined, "setCurrentOrg"),
    }),
    { name: "AppStore" }
  )
);

export default useStore;
