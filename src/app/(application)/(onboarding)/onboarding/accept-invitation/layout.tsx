import React from "react";

export default function AcceptInvitationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-background p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
