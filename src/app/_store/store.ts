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

type Team = {
  id: string;
  name: string;
  description: string | null;
  organizationId: string;
  memberCount: number;
  createdAt: string;
};

type Workflow = {
  id: string;
  name: string;
  description: string;
  projectId: string;
  projectName: string;
  teamId: string;
  teamName: string;
  organizationId: string;
  memberCount: number;
  createdAt: string;
};

interface StoreState {
  currentUser: SessionClaims | null;
  setCurrentUser: (user: SessionClaims) => void;
  clientFingerprint: string;
  setClientFingerprint: (fingerprint: string) => void;
  currentOrg: Organization | null;
  setCurrentOrg: (org: Organization) => void;
  currentTeam: Team | null;
  setCurrentTeam: (team: Team) => void;
  teams: Team[];
  setTeams: (teams: Team[]) => void;
  currentWorkflow: Workflow | null;
  setCurrentWorkflow: (workflow: Workflow | null) => void;
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
      currentTeam: null,
      setCurrentTeam: (team: Team) =>
        set({ currentTeam: team }, undefined, "setCurrentTeam"),
      teams: [],
      setTeams: (teams: Team[]) => set({ teams }, undefined, "setTeams"),
      currentWorkflow: null,
      setCurrentWorkflow: (workflow: Workflow | null) =>
        set({ currentWorkflow: workflow }, undefined, "setCurrentWorkflow"),
    }),
    { name: "AppStore" }
  )
);

export default useStore;
export type { Workflow };
