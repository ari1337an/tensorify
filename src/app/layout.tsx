import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";
import { dark } from "@clerk/themes";

export const metadata: Metadata = {
  title: "Please Wait - App",
  description: "We are redirecting you.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {},
      }}
    >
      <html lang="en">
        <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
        </head>
        <body className="bg-[#121111]">{children}</body>
      </html>
    </ClerkProvider>
  );
}
