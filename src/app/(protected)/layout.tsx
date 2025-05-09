import { redirect } from "next/navigation";
import AppWrapper from "@enterprise/_components/layout/AppWrapper";
import { checkUserOnboarded } from "@/server/flows/onboarding/check-onboarded";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check if user is onboarded before rendering protected content
  const result = await checkUserOnboarded();

  // Handle redirects from the checkUserOnboarded function
  if (result && "redirect" in result) {
    // If in development, we need to handle the redirect manually to avoid NEXT_REDIRECT errors
    redirect(result.redirect);
  }

  return <AppWrapper>{children}</AppWrapper>;
}
