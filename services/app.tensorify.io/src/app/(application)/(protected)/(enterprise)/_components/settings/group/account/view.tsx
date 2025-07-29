"use client";

import * as React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/ui/avatar";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Separator } from "@/app/_components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import { InfoIcon, Upload, Loader2 } from "lucide-react";
import {
  TooltipTrigger,
  TooltipContent,
  Tooltip,
  TooltipProvider,
} from "@/app/_components/ui/tooltip";
import { useAccountLogic } from "./logic";
import { formatDistanceToNow } from "date-fns";

export function AccountView() {
  const {
    currentUser,
    firstName,
    lastName,
    setFirstName,
    setLastName,
    handleProfileImageUpload,
    isUploading,
    isSavingFirstName,
    isSavingLastName,
    sessions,
    isLoadingSessions,
    handleSignOutAllDevices,
    currentSession,
  } = useAccountLogic();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleProfileImageUpload(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Section */}
      <div>
        <h3 className="text-xl font-semibold">Account</h3>
        <Separator className="my-4" />
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="space-y-6">
          <div className="flex flex-row items-center justify-start gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={currentUser?.imageUrl}
                alt={currentUser?.firstName || ""}
              />
              <AvatarFallback>
                {firstName.charAt(0)}
                {lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2 flex flex-col items-start">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <Button
                variant="outline"
                className="text-sm"
                onClick={handleUploadClick}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload portrait
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground">
                Recommended size 1:1, up to 10MB.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-2xl">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="firstName">First name</Label>
                <span
                  className={`text-sm text-muted-foreground min-w-[60px] text-right ${
                    isSavingFirstName ? "opacity-100" : "opacity-0"
                  }`}
                >
                  Saving...
                </span>
              </div>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="lastName">Last name</Label>
                <span
                  className={`text-sm text-muted-foreground min-w-[60px] text-right ${
                    isSavingLastName ? "opacity-100" : "opacity-0"
                  }`}
                >
                  Saving...
                </span>
              </div>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
              />
            </div>
          </div>
        </div>

        {/* Account Security Section */}
        <div className="space-y-4 pt-6">
          <h3 className="text-xl font-semibold">Account security</h3>
          <Separator className="mb-4" />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-4 hover:cursor-not-allowed">
                <Input
                  id="email"
                  type="email"
                  value={currentUser?.email || ""}
                  disabled
                  className="max-w-md "
                />
                <Button disabled variant="outline">
                  Change email
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Devices Section */}
        <div className="space-y-4 pt-6">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold">Devices</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <InfoIcon className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Log out of all other active sessions on other devices
                    besides this one.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Separator className="mb-4" />

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-medium">
                  Log out of all devices
                </h4>
                <p className="text-sm text-muted-foreground">
                  Log out of all other active sessions on other devices besides
                  this one.
                </p>
              </div>
              <Button
                variant="outline"
                className="shrink-0"
                onClick={handleSignOutAllDevices}
                disabled={isLoadingSessions}
              >
                {isLoadingSessions ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Log out of all devices"
                )}
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[200px]">Device</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingSessions ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={3} className="text-center">
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : sessions.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground"
                      >
                        No active sessions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    sessions.map((session) => (
                      <TableRow
                        key={session.id}
                        className="hover:bg-transparent"
                      >
                        <TableCell className="font-medium">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span>
                                {session.latestActivity?.deviceType ||
                                  "Unknown Device"}
                              </span>
                              {session.id === currentSession?.id && (
                                <span className="text-xs text-primary-readable bg-primary/10 px-2 py-0.5 rounded-md">
                                  This Device
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {session.latestActivity?.browserName}{" "}
                              {session.latestActivity?.browserVersion}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              IP: {session.latestActivity?.ipAddress}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Session ID: {session.id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(session.lastActiveAt), {
                            addSuffix: true,
                          })}
                        </TableCell>
                        <TableCell>
                          {session.latestActivity?.city &&
                          session.latestActivity?.country
                            ? `${session.latestActivity.city}, ${session.latestActivity.country}`
                            : "Unknown Location"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="text-sm text-muted-foreground">
              {isLoadingSessions
                ? "Loading sessions..."
                : `${sessions.length} active session${
                    sessions.length !== 1 ? "s" : ""
                  }`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountView;
