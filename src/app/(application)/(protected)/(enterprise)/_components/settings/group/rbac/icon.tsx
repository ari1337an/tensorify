import * as React from "react";
import { LockKeyhole } from "lucide-react";

interface RBACIconProps {
  className?: string;
}

export function RBACIcon({ className }: RBACIconProps) {
  return <LockKeyhole className={className} aria-hidden="true" />;
}

export default RBACIcon;
