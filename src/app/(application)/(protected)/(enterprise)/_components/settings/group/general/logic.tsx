"use client";

import * as React from "react";
import { getOrganization } from "@/app/api/v1/_client/client";
import useStore from "@/app/_store/store";

export function useGeneralLogic() {
  const currentOrg = useStore((state) => state.currentOrg);
  const setCurrentOrg = useStore((state) => state.setCurrentOrg);

  const [organizationName, setOrganizationName] = React.useState("");
  const [organizationSlug, setOrganizationSlug] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [isValidSlug, setIsValidSlug] = React.useState(true);
  const [slugError, setSlugError] = React.useState<string | null>(null);

  // Initialize from current org or fetch data
  React.useEffect(() => {
    if (currentOrg) {
      setOrganizationName(currentOrg.name);
      setOrganizationSlug(currentOrg.slug);
      validateSlug(currentOrg.slug);
    } else {
      fetchOrganizationData();
    }
  }, [currentOrg]);

  const fetchOrganizationData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getOrganization({});

      if (response.status === 200) {
        const organizations = response.body;
        if (organizations.length > 0) {
          const firstOrg = organizations[0];
          // Create a proper Organization object for the store
          const fullOrg = {
            ...firstOrg,
            createdById: "", // These fields are not provided by the API but required by Prisma model
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setCurrentOrg(fullOrg);
          setOrganizationName(firstOrg.name);
          setOrganizationSlug(firstOrg.slug);
          validateSlug(firstOrg.slug);
        }
      } else {
        setError("Failed to fetch organization data");
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch organization data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const validateSlug = (slug: string) => {
    const SLUG_MIN_LENGTH = 3;
    const SLUG_MAX_LENGTH = 63;

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

  const handleSlugChange = (value: string) => {
    const sanitizedValue = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setOrganizationSlug(sanitizedValue);
    validateSlug(sanitizedValue);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      // TODO: Implement organization update endpoint
      // For now, we'll simulate a successful update
      console.log("Saving organization details:", {
        name: organizationName,
        slug: organizationSlug,
      });

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update local state
      if (currentOrg) {
        const updatedOrg = {
          ...currentOrg,
          name: organizationName,
          slug: organizationSlug,
          updatedAt: new Date(),
        };
        setCurrentOrg(updatedOrg);
      }

      setSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
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

  const isFormValid = organizationName.length > 0 && isValidSlug;

  return {
    organizationName,
    organizationSlug,
    setOrganizationName,
    setOrganizationSlug: handleSlugChange,
    handleSave,
    isLoading,
    error,
    success,
    isValidSlug,
    slugError,
    isFormValid,
    setError,
    setSuccess,
  };
}

export default useGeneralLogic;
