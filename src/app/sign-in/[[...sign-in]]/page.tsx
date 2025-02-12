import { SignIn } from "@clerk/nextjs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Tensorify",
  description: "Access your account by signing in",
};

export default function Page() {
  return (
    <div className="min-h-screen flex flex-row items-center justify-center">
      <SignIn />
    </div>
  );
}
