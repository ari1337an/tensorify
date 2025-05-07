"use client";

import * as React from "react";
import useStore from "@/app/_store/store";
import { useUser, useSession } from "@clerk/nextjs";
import { toast } from "sonner";
import { getSessions, revokeSession } from "./server";
import { debounce } from "lodash";

interface SessionWithActivities {
  id: string;
  pathRoot: string;
  status: string;
  abandonAt: string;
  expireAt: string;
  lastActiveAt: Date;
  latestActivity?: {
    id: string;
    deviceType: string;
    browserName: string;
    browserVersion: string;
    country: string;
    city: string;
    isMobile: boolean;
    ipAddress: string;
  };
  actor: null;
}

export function useAccountLogic() {
  const { user } = useUser();
  const { session: currentSession } = useSession();
  const currentUser = useStore((state) => state.currentUser);
  const [firstName, setFirstName] = React.useState(
    currentUser?.firstName || ""
  );
  const [lastName, setLastName] = React.useState(currentUser?.lastName || "");
  const [isUploading, setIsUploading] = React.useState(false);
  const [isSavingFirstName, setIsSavingFirstName] = React.useState(false);
  const [isSavingLastName, setIsSavingLastName] = React.useState(false);
  const [sessions, setSessions] = React.useState<SessionWithActivities[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = React.useState(true);

  const fetchSessions = React.useCallback(async () => {
    if (!user) return;
    try {
      setIsLoadingSessions(true);
      const userSessions = await getSessions(user.id);
      setSessions(userSessions as unknown as SessionWithActivities[]);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Failed to load sessions");
    } finally {
      setIsLoadingSessions(false);
    }
  }, [user]);

  React.useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleSignOutAllDevices = async () => {
    if (!user || !currentSession) return;
    try {
      setIsLoadingSessions(true);
      // Get all sessions except the current one
      const otherSessions = sessions.filter(
        (session) => session.id !== currentSession.id
      );

      // Sign out from all other sessions
      await Promise.all(
        otherSessions.map((session) => revokeSession(session.id))
      );

      // Refresh sessions after signing out
      const userSessions = await getSessions(user.id);
      setSessions(userSessions as unknown as SessionWithActivities[]);

      toast.success("Successfully signed out from all other devices");
    } catch (error) {
      console.error("Error signing out from other devices:", error);
      toast.error("Failed to sign out from other devices");
    } finally {
      await fetchSessions();
    }
  };

  const debouncedSaveFirstName = React.useCallback(
    debounce(async (value: string) => {
      if (!user) return;
      try {
        setIsSavingFirstName(true);
        await user.update({ firstName: value });
        toast.success("First name updated successfully");
      } catch (error) {
        console.error("Error updating first name:", error);
        toast.error("Failed to update first name");
      } finally {
        setIsSavingFirstName(false);
      }
    }, 1000),
    [user]
  );

  const debouncedSaveLastName = React.useCallback(
    debounce(async (value: string) => {
      if (!user) return;
      try {
        setIsSavingLastName(true);
        await user.update({ lastName: value });
        toast.success("Last name updated successfully");
      } catch (error) {
        console.error("Error updating last name:", error);
        toast.error("Failed to update last name");
      } finally {
        setIsSavingLastName(false);
      }
    }, 1000),
    [user]
  );

  const handleFirstNameChange = React.useCallback(
    (value: string) => {
      setFirstName(value);
      debouncedSaveFirstName(value);
    },
    [debouncedSaveFirstName]
  );

  const handleLastNameChange = React.useCallback(
    (value: string) => {
      setLastName(value);
      debouncedSaveLastName(value);
    },
    [debouncedSaveLastName]
  );

  const handleProfileImageUpload = async (file: File) => {
    if (!file) return;

    try {
      setIsUploading(true);
      await user?.setProfileImage({ file });
      toast.success("Profile image updated successfully");
    } catch (error) {
      console.error("Error uploading profile image:", error);
      toast.error("Failed to update profile image");
    } finally {
      setIsUploading(false);
    }
  };

  return {
    currentUser,
    firstName,
    lastName,
    setFirstName: handleFirstNameChange,
    setLastName: handleLastNameChange,
    handleProfileImageUpload,
    isUploading,
    isSavingFirstName,
    isSavingLastName,
    sessions,
    isLoadingSessions,
    handleSignOutAllDevices,
    currentSession,
  };
}

export default useAccountLogic;
