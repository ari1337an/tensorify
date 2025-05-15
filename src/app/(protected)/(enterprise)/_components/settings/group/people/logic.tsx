"use client";

import * as React from "react";
import { TeamMember } from "./columns";

export function usePeopleLogic() {
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      avatar: "",
      role: "super admin",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      avatar: "",
      role: "member",
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob@example.com",
      avatar: "",
      role: "viewer",
    },
    {
      id: "4",
      name: "Alice Williams",
      email: "alice@example.com",
      avatar: "",
      role: "admin",
    },
  ]);

  const handleRoleChange = (userId: string, newRole: string) => {
    setTeamMembers((prev) =>
      prev.map((member) =>
        member.id === userId ? { ...member, role: newRole } : member
      )
    );
    // TODO: Implement API call to update user role
    console.log(`Changed role for user ${userId} to ${newRole}`);
  };

  const handleInvite = () => {
    // TODO: Implement invite functionality
    console.log("Opening invite dialog");
  };

  return {
    teamMembers,
    handleRoleChange,
    handleInvite,
  };
}

export default usePeopleLogic;
