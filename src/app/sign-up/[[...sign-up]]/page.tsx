import { SignUp } from "@clerk/nextjs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Tensorify",
  description: "Create a new account",
};

export default function Page() {
  return (
    <div className="min-h-screen flex flex-row items-center justify-center">
      <SignUp />
    </div>
  );
}
