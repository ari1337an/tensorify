"use client";

import { useEffect } from "react";
import useStore from "@/app/_store/store";

type Team = {
  id: string;
  name: string;
  description: string | null;
  organizationId: string;
  memberCount: number;
  createdAt: string;
};

export function TeamProvider({
  children,
  teams,
  currentTeam,
}: {
  children: React.ReactNode;
  teams: string;
  currentTeam?: string;
}) {
  const setTeams = useStore((state) => state.setTeams);
  const setCurrentTeam = useStore((state) => state.setCurrentTeam);

  useEffect(() => {
    if (teams) {
      const teamsData = JSON.parse(teams) as Team[];
      setTeams(teamsData);
    }
  }, [teams, setTeams]);

  useEffect(() => {
    if (currentTeam) {
      const currentTeamData = JSON.parse(currentTeam) as Team;
      setCurrentTeam(currentTeamData);
    }
  }, [currentTeam, setCurrentTeam]);

  return <>{children}</>;
}
