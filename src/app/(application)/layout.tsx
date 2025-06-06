"use server";
import type { Metadata } from "next";
import { ProvidersWrapper } from "@/app/_providers/providers-wrapper";
import "../globals.css";
import { auth } from "@clerk/nextjs/server";
import db from "@/server/database/db";
import { Toaster } from "@/app/_components/ui/sonner";

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

  // Fetch organization data for the current user
  const organization = await db.organization.findFirst({
    where: {
      createdById: sessionClaims?.sub as string,
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: {
      createdAt: "asc", // first organization is the default organization
    },
  });

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
