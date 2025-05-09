import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ProvidersWrapper } from "@/app/_providers/providers-wrapper";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Tensorify Studio",
  description:
    "Tensorify Studio is a platform for writing AI pipelines visually.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased bg-background text-foreground min-h-screen font-[family-name:var(--font-inter)] font-medium`}
      >
        <ProvidersWrapper>{children}</ProvidersWrapper>
      </body>
    </html>
  );
}
