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

  return (
    <ProvidersWrapper
      sessionClaims={JSON.stringify(sessionClaims)}
      organization={JSON.stringify(organization)}
    >
      <Toaster />
      {children}
    </ProvidersWrapper>
  );
}
