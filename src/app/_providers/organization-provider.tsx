"use client";

import { useEffect } from "react";
import useStore from "@/app/_store/store";
import { Organization } from "@prisma/client";

export function OrganizationProvider({
  children,
  organization,
}: {
  children: React.ReactNode;
  organization: string;
}) {
  const setCurrentOrg = useStore((state) => state.setCurrentOrg);

  useEffect(() => {
    if (organization) {
      const orgData = JSON.parse(organization) as Organization;
      setCurrentOrg(orgData);
    }
  }, [organization, setCurrentOrg]);

  return <>{children}</>;
}
