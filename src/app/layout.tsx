import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppWrapper } from "@/app/(enterprise)/_components/layout";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} antialiased bg-background text-foreground min-h-screen font-[family-name:var(--font-inter)] font-medium`}
      >
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
}
