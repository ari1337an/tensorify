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

// Define a minimal interface for Clerk User with just the properties we need
interface ClerkUser {
  id: string;
  update: (data: { firstName?: string; lastName?: string }) => Promise<unknown>;
  setProfileImage: (options: { file: File }) => Promise<unknown>;
  reload: () => Promise<unknown>;
}

export function useAccountLogic() {
  const { user } = useUser();
  const { session: currentSession } = useSession();
  const currentUser = useStore((state) => state.currentUser);
  const setCurrentUser = useStore((state) => state.setCurrentUser);
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

  // Create a debounced function outside useCallback
  const saveFirstNameWithDebounce = React.useMemo(
    () =>
      debounce(
        async (
          value: string,
          userData: ClerkUser | null | undefined,
          setIsSaving: (state: boolean) => void
        ) => {
          if (!userData) return;
          try {
            setIsSaving(true);
            await userData.update({ firstName: value });

            // Update the first name in the store
            if (currentUser) {
              setCurrentUser({
                ...currentUser,
                firstName: value,
              });
            }

            toast.success("First name updated successfully");
          } catch (error) {
            console.error("Error updating first name:", error);
            toast.error("Failed to update first name");
          } finally {
            setIsSaving(false);
          }
        },
        1000
      ),
    [currentUser, setCurrentUser]
  );

  // Create a debounced function outside useCallback
  const saveLastNameWithDebounce = React.useMemo(
    () =>
      debounce(
        async (
          value: string,
          userData: ClerkUser | null | undefined,
          setIsSaving: (state: boolean) => void
        ) => {
          if (!userData) return;
          try {
            setIsSaving(true);
            await userData.update({ lastName: value });

            // Update the last name in the store
            if (currentUser) {
              setCurrentUser({
                ...currentUser,
                lastName: value,
              });
            }

            toast.success("Last name updated successfully");
          } catch (error) {
            console.error("Error updating last name:", error);
            toast.error("Failed to update last name");
          } finally {
            setIsSaving(false);
          }
        },
        1000
      ),
    [currentUser, setCurrentUser]
  );

  const debouncedSaveFirstName = React.useCallback(
    (value: string) => {
      saveFirstNameWithDebounce(value, user as ClerkUser, setIsSavingFirstName);
    },
    [saveFirstNameWithDebounce, user]
  );

  const debouncedSaveLastName = React.useCallback(
    (value: string) => {
      saveLastNameWithDebounce(value, user as ClerkUser, setIsSavingLastName);
    },
    [saveLastNameWithDebounce, user]
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

    // Check file size (10MB = 10 * 1024 * 1024 bytes)
    const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxFileSize) {
      toast.error("File size must be less than 10MB");
      return;
    }

    try {
      setIsUploading(true);
      await (user as ClerkUser)?.setProfileImage({ file });

      // Force reload the user data to refresh the avatar
      await user?.reload();

      // Update the current user in the store
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          imageUrl: user?.imageUrl || currentUser.imageUrl,
        });
      }

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
