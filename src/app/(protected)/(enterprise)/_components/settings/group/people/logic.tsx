"use client";

import * as React from "react";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
};

export function usePeopleLogic() {
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      avatar: "",
      role: "admin",
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
  ]);

  const [searchQuery, setSearchQuery] = React.useState("");

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
    teamMembers: teamMembers.filter(
      (member) =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    searchQuery,
    setSearchQuery,
    handleRoleChange,
    handleInvite,
  };
}

export default usePeopleLogic;
