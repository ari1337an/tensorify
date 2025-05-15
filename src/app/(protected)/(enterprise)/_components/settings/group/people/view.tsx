"use client";

import { useEffect, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import {
  getOrganizationMembers,
  type OrganizationMember,
} from "@/server/actions/organization-actions";
import { Button } from "@/app/_components/ui/button";
import { Loader2, UserPlus } from "lucide-react";
import { Separator } from "@/app/_components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";

const AVAILABLE_ROLES = [
  { id: "member", name: "Member" },
  { id: "admin", name: "Admin" },
  { id: "viewer", name: "Viewer" },
] as const;

type Role = (typeof AVAILABLE_ROLES)[number]["id"];

export default function PeopleView({
  organizationId,
}: {
  organizationId: string;
}) {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("member");
  const [isInviting, setIsInviting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    async function loadMembers() {
      try {
        setLoading(true);
        const data = await getOrganizationMembers(organizationId);
        setMembers(data);
        setError(null);
      } catch (err) {
        setError("Failed to load organization members");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadMembers();
  }, [organizationId]);

  const handleInvite = async () => {
    if (!inviteEmail || !selectedRole) return;

    try {
      setIsInviting(true);
      // TODO: Implement the actual invite functionality
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated delay
      console.log("Inviting:", inviteEmail, "with role:", selectedRole);
      setInviteEmail("");
      setSelectedRole("member"); // Reset to default
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Failed to invite member:", err);
    } finally {
      setIsInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Loading members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  const inviteButton = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8">
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation email to add a new team member.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as Role)}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_ROLES.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {selectedRole === "admin"
                ? "Can manage team members and all settings"
                : selectedRole === "member"
                  ? "Can view and edit content"
                  : "Can only view content"}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleInvite}
            disabled={!inviteEmail || !selectedRole || isInviting}
            className="w-full"
          >
            {isInviting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Invitation...
              </>
            ) : (
              "Send Invitation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Organization Members</h2>
        <p className="text-sm text-muted-foreground">
          Manage organization members and their roles in the organization.
        </p>
      </div>

      <Separator />

      <DataTable columns={columns} data={members} inviteButton={inviteButton} />
    </div>
  );
}
