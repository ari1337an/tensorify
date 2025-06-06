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
import { AlertCircle, CheckCircle2, Link } from "lucide-react";
import { Alert, AlertDescription } from "@/app/_components/ui/alert";
import { useGeneralLogic } from "./logic";

export function OrganizationSettingsView() {
  const {
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
    isFormValid,
  } = useGeneralLogic();

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
                    onChange={(e) => setOrganizationSlug(e.target.value)}
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
