"use server";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ProvidersWrapper } from "@/app/_providers/providers-wrapper";
import "./globals.css";
import { auth } from "@clerk/nextjs/server";
import db from "@/server/database/db";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

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
      superAdminId: sessionClaims?.sub as string,
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased bg-background text-foreground min-h-screen font-[family-name:var(--font-inter)] font-medium`}
      >
        <ProvidersWrapper
          sessionClaims={JSON.stringify(sessionClaims)}
          organization={JSON.stringify(organization)}
        >
          {children}
        </ProvidersWrapper>
      </body>
    </html>
  );
}
