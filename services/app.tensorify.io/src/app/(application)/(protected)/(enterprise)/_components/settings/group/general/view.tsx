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
import {
  AlertCircle,
  CheckCircle2,
  Link,
  ExternalLink,
  Building2,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/app/_components/ui/alert";
import { useGeneralLogic } from "./logic";

export function OrganizationSettingsView() {
  const {
    // Current org editing
    organizationName,
    organizationSlug,
    setOrganizationName,
    setOrganizationSlug,
    handleSave,
    isLoading,
    error,
    success,
    isValidSlug,
    slugError,
    // isFormValid,

    // Organizations list
    otherOrganizations,
    loadingOrganizations,
    organizationsError,
    handleOpenOrganization,
  } = useGeneralLogic();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Organization Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your current organization or navigate to others you have access
          to.
        </p>
      </div>

      <Separator />

      {/* Current Organization Edit Card */}
      <Card className="bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-primary">Current Organization</CardTitle>
          </div>
          <CardDescription>
            Update your current organization information visible to all members.
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
                // disabled={isLoading}
                disabled={true}
                className="max-w-md h-11 hover:cursor-not-allowed"
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
                    onChange={(e) => setOrganizationSlug(e.target.value)}
                    placeholder="your-organization"
                    className={`h-11 pr-10 hover:cursor-not-allowed font-mono ${
                      isValidSlug ? "border-green-500/50" : "border-red-500/50"
                    }`}
                    // disabled={isLoading}
                    disabled={true}
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
              // disabled={isLoading || !isFormValid}
              disabled={true}
              className="min-w-[100px] hover:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Other Organizations Navigation Cards */}
      {loadingOrganizations ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading organizations...</span>
          </CardContent>
        </Card>
      ) : organizationsError ? (
        <Card>
          <CardContent className="py-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{organizationsError}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : otherOrganizations.length > 0 ? (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-medium">Other Organizations</h3>
            <p className="text-sm text-muted-foreground">
              Organizations you have access to
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {otherOrganizations.map((org) => (
              <Card
                key={org.id}
                className="group hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{org.name}</CardTitle>
                      <CardDescription className="font-mono text-xs">
                        {org.slug}.app.tensorify.io
                      </CardDescription>
                    </div>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    onClick={() => handleOpenOrganization(org.slug)}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-base font-medium">No other organizations</h3>
            <p className="text-sm text-muted-foreground">
              You currently only have access to this organization.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default OrganizationSettingsView;
