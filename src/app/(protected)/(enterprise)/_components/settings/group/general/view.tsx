"use client";

import * as React from "react";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Button } from "@/app/_components/ui/button";
import { Separator } from "@/app/_components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import useStore from "@/app/_store/store";
import { updateOrganization } from "@/server/actions/organization-actions";
import { useRouter } from "next/navigation";
import { Organization } from "@prisma/client";
import { AlertCircle, CheckCircle2, Link } from "lucide-react";
import { Alert, AlertDescription } from "@/app/_components/ui/alert";

const SLUG_MIN_LENGTH = 3;
const SLUG_MAX_LENGTH = 63; // Standard subdomain length limit

export function OrganizationSettingsView() {
  const router = useRouter();
  const currentOrg = useStore((state) => state.currentOrg);
  const setCurrentOrg = useStore((state) => state.setCurrentOrg);

  const [isLoading, setIsLoading] = React.useState(false);
  const [organizationName, setOrganizationName] = React.useState(
    currentOrg?.name || ""
  );
  const [organizationSlug, setOrganizationSlug] = React.useState(
    currentOrg?.slug || ""
  );
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [isValidSlug, setIsValidSlug] = React.useState(true);
  const [slugError, setSlugError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (currentOrg) {
      setOrganizationName(currentOrg.name);
      setOrganizationSlug(currentOrg.slug);
      validateSlug(currentOrg.slug);
    }
  }, [currentOrg]);

  const validateSlug = (slug: string) => {
    if (slug.length < SLUG_MIN_LENGTH) {
      setSlugError(`URL must be at least ${SLUG_MIN_LENGTH} characters`);
      setIsValidSlug(false);
      return false;
    }
    if (slug.length > SLUG_MAX_LENGTH) {
      setSlugError(`URL cannot exceed ${SLUG_MAX_LENGTH} characters`);
      setIsValidSlug(false);
      return false;
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setSlugError(
        "URL can only contain lowercase letters, numbers, and hyphens"
      );
      setIsValidSlug(false);
      return false;
    }
    setSlugError(null);
    setIsValidSlug(true);
    return true;
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      const result = await updateOrganization({
        name: organizationName,
        slug: organizationSlug,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      if (result.data) {
        setCurrentOrg(result.data as Organization);
        setSuccess(true);
      }

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update organization settings"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    // Only allow lowercase letters, numbers, and hyphens
    const sanitizedValue = value.replace(/[^a-z0-9-]/g, "");
    setOrganizationSlug(sanitizedValue);
    validateSlug(sanitizedValue);
  };

  const isFormValid = organizationName.length > 0 && isValidSlug;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Organization Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your organization name and slug.
        </p>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>
            Update your organization information visible to all members.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Organization settings updated successfully
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization name</Label>
              <Input
                id="organizationName"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Enter organization name"
                disabled={isLoading}
                className="max-w-md h-11"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="organizationSlug"
                className="flex items-center gap-2"
              >
                <Link className="h-4 w-4 text-muted-foreground" />
                Organization slug
              </Label>
              <div className="flex items-center gap-2 max-w-md">
                <div className="relative flex-1">
                  <Input
                    id="organizationSlug"
                    value={organizationSlug}
                    onChange={handleSlugChange}
                    placeholder="your-organization"
                    className={`h-11 pr-10 font-mono ${
                      isValidSlug ? "border-green-500/50" : "border-red-500/50"
                    }`}
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isValidSlug ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground whitespace-nowrap px-3 py-2 bg-muted rounded-md">
                  .app.tensorify.io
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {slugError ||
                  "Only lowercase letters, numbers, and hyphens are allowed"}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isLoading || !isFormValid}
              className="min-w-[100px]"
            >
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OrganizationSettingsView;
