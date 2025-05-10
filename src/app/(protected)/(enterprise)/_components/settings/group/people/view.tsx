"use client";

import * as React from "react";
import { Button } from "@/app/_components/ui/button";
import { Separator } from "@/app/_components/ui/separator";
import { Input } from "@/app/_components/ui/input";
import { Search, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/ui/avatar";
import { usePeopleLogic } from "./logic";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/app/_components/ui/dialog";
import { useState } from "react";
import { sendInviteEmailAction } from "@/server/actions/email-actions";

export function PeopleView() {
  const { teamMembers, searchQuery, setSearchQuery, handleRoleChange } =
    usePeopleLogic();

  // Dialog state
  const [open, setOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    success: boolean;
    message: string;
  }>(null);

  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const data = await sendInviteEmailAction(inviteEmail);
      if (data.success) {
        setResult({ success: true, message: "Invite email sent!" });
        setInviteEmail("");
      } else {
        setResult({
          success: false,
          message: data.error || "Failed to send email.",
        });
      }
    } catch {
      setResult({ success: false, message: "Error sending email." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Organization Members</h2>
        <p className="text-sm text-muted-foreground">
          Manage organization members and their roles in the organization.
        </p>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-8 w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Invite people
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite People</DialogTitle>
              <DialogDescription>
                Send an invite email to a new member.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSendInvite} className="space-y-4">
              <Input
                placeholder="Email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send Invite"}
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="ghost">
                    Cancel
                  </Button>
                </DialogClose>
              </DialogFooter>
              {result && (
                <p
                  className={result.success ? "text-green-600" : "text-red-600"}
                >
                  {result.message}
                </p>
              )}
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{member.name}</span>
                  </div>
                </TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                  <Select
                    defaultValue={member.role}
                    onValueChange={(value) =>
                      handleRoleChange(member.id, value)
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default PeopleView;
