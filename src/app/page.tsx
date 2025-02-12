import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  redirect(
    !userId
      ? (process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL as string)
      : (process.env.REDIRECT_AFTER_SIGNIN_URL as string)
  );
}
