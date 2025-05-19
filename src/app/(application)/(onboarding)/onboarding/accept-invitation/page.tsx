"use client";

import { useEffect, useState } from "react";
import { useAuth, useSession } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getPendingInvitationForUserByEmail,
  getPendingInvitationById,
  acceptInvitation,
  declineInvitation,
} from "@/server/actions/invitation-actions";
import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Loader2 } from "lucide-react";
import type { Prisma } from "@prisma/client";

// Custom type to use string instead of InvitationStatus enum
type InvitationWithOrg = {
  id: string;
  email: string;
  organizationId: string;
  roleIds: Prisma.JsonValue;
  status: string;
  expiresAt: Date;
  invitedById: string;
  createdAt: Date;
  updatedAt: Date;
  organization: {
    id: string;
    name: string;
    slug: string;
    superAdminId: string;
  };
};

export default function AcceptInvitationPage() {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const { session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitationToken = searchParams.get("token");
  const [invitation, setInvitation] = useState<InvitationWithOrg | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isLoaded) return; // Wait for Clerk to load

    if (!isSignedIn || !userId) {
      // If not signed in, or essential user data is missing, redirect to sign-in.
      // The `check-onboarded` flow should ideally handle this, but as a fallback:
      router.push(
        "/sign-in?redirect_url=/onboarding/accept-invitation" +
          (invitationToken ? `?token=${invitationToken}` : "")
      );
      return;
    }

    const userEmail = session?.user?.emailAddresses[0].emailAddress as string;

    async function fetchInvitation() {
      try {
        setLoading(true);
        // If we have a specific token, use it to get the invitation directly
        // Otherwise fall back to checking by email
        let result;
        if (invitationToken) {
          result = await getPendingInvitationById(invitationToken);
        } else {
          result = await getPendingInvitationForUserByEmail(userEmail);
        }

        if (result.success) {
          if (result.invitation) {
            setInvitation(result.invitation);
          } else {
            // No pending invitation, redirect to standard onboarding or dashboard if already onboarded.
            // For simplicity, redirecting to onboarding. The main check-onboarded flow will handle further.
            setError("No pending invitation found. You will be redirected.");
            setTimeout(() => router.push("/onboarding"), 3000);
          }
        } else {
          setError(result.error || "Failed to fetch invitation details.");
        }
      } catch (err) {
        console.error("Error fetching invitation:", err);
        setError(
          "An unexpected error occurred while fetching your invitation."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchInvitation();
  }, [userId, isLoaded, isSignedIn, router, invitationToken, session?.user?.emailAddresses]);

  const handleAccept = async () => {
    if (!invitation) return;
    setIsProcessing(true);
    try {
      const result = await acceptInvitation(invitation.id);
      if (result.success) {
        // Construct the redirect URL to the organization
        // This needs to align with how org URLs are structured (subdomain or path)
        // Assuming subdomain structure like {slug}.app.tensorify.io or {slug}.localhost:port
        const currentHost = window.location.host;
        const protocol = window.location.protocol; // http: or https:
        let redirectUrl = "/";

        if (process.env.NODE_ENV === "production") {
          redirectUrl = `${protocol}//${result.organizationSlug}.app.tensorify.io`;
        } else {
          const port = currentHost.includes(":")
            ? currentHost.split(":")[1]
            : "3000";
          redirectUrl = `${protocol}//${result.organizationSlug}.localhost:${port}`;
        }
        window.location.href = redirectUrl; // Full page redirect to handle potential domain change
      } else {
        setError(result.error || "Failed to accept invitation.");
      }
    } catch (err) {
      console.error("Error accepting invitation:", err);
      setError("An unexpected error occurred while accepting the invitation.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!invitation) return;
    setIsProcessing(true);
    try {
      const result = await declineInvitation(invitation.id);
      if (result.success) {
        setError("Invitation declined. You will be redirected.");
        setTimeout(() => router.push("/onboarding"), 3000);
      } else {
        setError(result.error || "Failed to decline invitation.");
      }
    } catch (err) {
      console.error("Error declining invitation:", err);
      setError("An unexpected error occurred while declining invitation.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || !isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading your invitation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full shadow-xl">
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>We encountered an issue.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push("/onboarding")} className="w-full">
            Go to Onboarding
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!invitation) {
    // This state should ideally be handled by redirection in useEffect, but as a fallback UI:
    return (
      <Card className="w-full shadow-xl">
        <CardHeader>
          <CardTitle>No Invitation Found</CardTitle>
          <CardDescription>
            There are no pending invitations for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            If you were expecting an invitation, please check with the person
            who invited you or try signing in again.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push("/onboarding")} className="w-full">
            Proceed to Onboarding
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Extract role names - This is a placeholder.
  // In a real app, you would fetch role names based on invitation.roleIds
  // For now, we assume roleIds are just strings we can display or we don't display them here.
  // const roleNames = invitation.roleIds.join(", ");

  return (
    <Card className="w-full shadow-xl bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">You&apos;re Invited!</CardTitle>
        <CardDescription>
          You have been invited to join the organization:
          <strong className="block text-lg text-foreground mt-1">
            {invitation.organization.name}
          </strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-sm text-muted-foreground">
          Accept the invitation to become a member and start collaborating.
          {/* {invitation.roleIds && (invitation.roleIds as string[]).length > 0 && 
            ` You will be assigned the role(s): ${(invitation.roleIds as string[]).join(', ')}.`
          } */}
          {/* Note: Displaying role names would require another fetch or embedding them in invitation if simple. For now, keeping it generic. */}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={handleAccept}
          className="w-full sm:w-auto flex-grow"
          disabled={isProcessing || !invitation}
        >
          {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
          Accept Invitation
        </Button>
        <Button
          onClick={handleDecline}
          variant="outline"
          className="w-full sm:w-auto"
          disabled={isProcessing || !invitation}
        >
          {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
          Decline
        </Button>
      </CardFooter>
    </Card>
  );
}
