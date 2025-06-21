"use server";
import type { Metadata } from "next";
import { ProvidersWrapper } from "@/app/_providers/providers-wrapper";
import "../globals.css";
import { auth } from "@clerk/nextjs/server";
import db from "@/server/database/db";
import { Toaster } from "@/app/_components/ui/sonner";
import { getCurrentSlugFromHost } from "@/server/utils/getCurrentSlugFromHost";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Tensorify Studio",
    description:
      "Tensorify Studio is a platform for writing AI pipelines visually.",
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims } = await auth();

  const host = (await headers()).get("host") || "";
  const currentSlug = await getCurrentSlugFromHost(host);

  // Fetch organization data for the current user
  const organization = currentSlug
    ? await db.organization.findUnique({
        where: {
          slug: currentSlug,
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      })
    : null;

  // Fetch teams data for the current organization
  const teams = organization
    ? await db.team.findMany({
        where: {
          orgId: organization.id,
        },
        include: {
          _count: {
            select: { members: true },
          },
        },
        orderBy: { createdAt: "asc" }, // Sort by creation date ascending (oldest first)
      })
    : [];

  // Transform teams data to match our schema
  const transformedTeams = teams.map((team) => ({
    id: team.id,
    name: team.name,
    description: team.description,
    organizationId: team.orgId,
    memberCount: team._count.members,
    createdAt: team.createdAt.toISOString(),
  }));

  // Select the first team as the current team (you can modify this logic)
  const currentTeam = transformedTeams.length > 0 ? transformedTeams[0] : null;

  return (
    <ProvidersWrapper
      sessionClaims={JSON.stringify(sessionClaims)}
      organization={JSON.stringify(organization)}
      teams={JSON.stringify(transformedTeams)}
      currentTeam={currentTeam ? JSON.stringify(currentTeam) : undefined}
    >
      <Toaster />
      {children}
    </ProvidersWrapper>
  );
}
