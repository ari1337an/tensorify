"use client";

import * as React from "react";
import { getOrganization } from "@/app/api/v1/_client/client";
import useStore from "@/app/_store/store";

type Organization = {
  id: string;
  name: string;
  slug: string;
};

export function useGeneralLogic() {
  const currentOrg = useStore((state) => state.currentOrg);
  const setCurrentOrg = useStore((state) => state.setCurrentOrg);

  // Current org editing states
  const [organizationName, setOrganizationName] = React.useState("");
  const [organizationSlug, setOrganizationSlug] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [isValidSlug, setIsValidSlug] = React.useState(true);
  const [slugError, setSlugError] = React.useState<string | null>(null);

  // Organizations list states
  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [loadingOrganizations, setLoadingOrganizations] = React.useState(false);
  const [organizationsError, setOrganizationsError] = React.useState<
    string | null
  >(null);

  // Initialize from current org or fetch data
  React.useEffect(() => {
    if (currentOrg) {
      setOrganizationName(currentOrg.name);
      setOrganizationSlug(currentOrg.slug);
      validateSlug(currentOrg.slug);
    }
    // Always fetch organizations list
    fetchOrganizations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrg]);

  const fetchOrganizations = async () => {
    try {
      setLoadingOrganizations(true);
      setOrganizationsError(null);

      const response = await getOrganization({});

      if (response.status === 200) {
        const organizationsData = response.body;
        setOrganizations(organizationsData);

        // If no current org is set, set the first one as current
        if (!currentOrg && organizationsData.length > 0) {
          const firstOrg = organizationsData[0];
          const fullOrg = {
            ...firstOrg,
            createdById: "",
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setCurrentOrg(fullOrg);
          setOrganizationName(firstOrg.name);
          setOrganizationSlug(firstOrg.slug);
          validateSlug(firstOrg.slug);
        }
      } else {
        setOrganizationsError("Failed to fetch organizations");
      }
    } catch (error) {
      setOrganizationsError(
        error instanceof Error ? error.message : "Failed to fetch organizations"
      );
    } finally {
      setLoadingOrganizations(false);
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
      // console.log("Saving organization details:", {
      //   name: organizationName,
      //   slug: organizationSlug,
      // });

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

        // Update organizations list as well
        setOrganizations((prev) =>
          prev.map((org) =>
            org.id === currentOrg.id
              ? { ...org, name: organizationName, slug: organizationSlug }
              : org
          )
        );
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

  const handleOpenOrganization = (slug: string) => {
    const baseUrl =
      process.env.NODE_ENV === "development"
        ? `${slug}.localhost:3000`
        : `${slug}.app.tensorify.io`;

    window.open(`http${process.env.NODE_ENV === "development" ? "" : "s"}://${baseUrl}`, "_blank");
  };

  // Get organizations excluding the current one
  const otherOrganizations = organizations.filter((org) =>
    currentOrg ? org.id !== currentOrg.id : true
  );

  const isFormValid = organizationName.length > 0 && isValidSlug;

  return {
    // Current org editing
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

    // Organizations list
    organizations,
    otherOrganizations,
    loadingOrganizations,
    organizationsError,
    handleOpenOrganization,
    currentOrg,
  };
}

export default useGeneralLogic;
