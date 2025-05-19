"use client";

import * as React from "react";
import { PeopleListEntry } from "./columns";

export function usePeopleLogic() {
  const [teamMembers, setTeamMembers] = React.useState<PeopleListEntry[]>([
    {
      id: "1",
      type: "member",
      name: "John Doe",
      email: "john@example.com",
      imageUrl: "",
      status: "Active",
      roles: [{ id: "1", name: "super admin" }],
      organizationId: "org1",
    },
    {
      id: "2",
      type: "member",
      name: "Jane Smith",
      email: "jane@example.com",
      imageUrl: "",
      status: "Active",
      roles: [{ id: "2", name: "member" }],
      organizationId: "org1",
    },
    {
      id: "3",
      type: "member",
      name: "Bob Johnson",
      email: "bob@example.com",
      imageUrl: "",
      status: "Active",
      roles: [{ id: "3", name: "viewer" }],
      organizationId: "org1",
    },
    {
      id: "4",
      type: "member",
      name: "Alice Williams",
      email: "alice@example.com",
      imageUrl: "",
      status: "Active",
      roles: [{ id: "4", name: "admin" }],
      organizationId: "org1",
    },
  ]);

  const handleRoleChange = (userId: string, newRole: string) => {
    setTeamMembers((prev) =>
      prev.map((member) =>
        member.id === userId
          ? { ...member, roles: [{ id: newRole, name: newRole }] }
          : member
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
