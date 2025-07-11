"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export default function CreatePluginButton() {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push("/plugins/create")}
      className="bg-primary text-primary-foreground hover:bg-primary/90"
    >
      Create Plugin
    </Button>
  );
}
