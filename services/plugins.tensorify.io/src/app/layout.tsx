import "./globals.css";
import { Inter } from "next/font/google";
import AppWrapper from "./_components/AppWrapper";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

// Metadata
export const metadata: Metadata = {
  title: "The official repository for Tensorify plugins",
  description:
    "The official repository of Tensorify plugins. Here you can find all the plugins that are available for Tensorify.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.className}`}>
      <body className="bg-background text-foreground min-h-screen">
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
}
