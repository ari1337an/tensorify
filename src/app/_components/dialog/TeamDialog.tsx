"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Avatar } from "../ui/avatar";

type InvitedMember = {
  id: string;
  email: string;
};

export function TeamDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [teamName, setTeamName] = React.useState("");
  const [emailInput, setEmailInput] = React.useState("");
  const [invitedMembers, setInvitedMembers] = React.useState<InvitedMember[]>(
    []
  );

  const handleAddMember = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && emailInput.trim()) {
      e.preventDefault();

      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput)) {
        return; // Invalid email
      }

      const newMember = {
        id: Date.now().toString(),
        email: emailInput.trim(),
      };

      setInvitedMembers([...invitedMembers, newMember]);
      setEmailInput("");
    }
  };

  const handleRemoveMember = (id: string) => {
    setInvitedMembers(invitedMembers.filter((member) => member.id !== id));
  };

  const handleCreateTeam = () => {
    if (!teamName.trim()) return;

    // Here you would handle team creation with the invited members
    console.log("Creating team:", teamName, invitedMembers);

    // Reset and close dialog
    setTeamName("");
    setEmailInput("");
    setInvitedMembers([]);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-5 w-5">
          <Plus className="h-3 w-3" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a team</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="team-name" className="text-sm font-medium">
              Team name
            </label>
            <Input
              id="team-name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="invite-members" className="text-sm font-medium">
              Invite members
            </label>
            <div className="flex flex-wrap gap-1 p-2 border rounded-md min-h-10">
              {invitedMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-full"
                >
                  <Avatar className="h-5 w-5 bg-primary/80 flex items-center justify-center text-white text-xs">
                    {member.email[0].toUpperCase()}
                  </Avatar>
                  <span className="text-xs">{member.email}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 rounded-full"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Input
                id="invite-members"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleAddMember}
                placeholder="Enter email addresses"
                className="flex-1 min-w-[200px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            variant="default"
            onClick={handleCreateTeam}
            disabled={!teamName.trim()}
          >
            Create Team
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
