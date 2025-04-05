"use client";
import { NavbarLeft } from "./NavbarLeft";
import { NavbarRight } from "./NavbarRight";

export function Navbar() {
  return (
    <nav className="border-b border-border bg-background h-11 flex justify-between">
      {/* Left side with burger menu & breadcrumb */}
      <NavbarLeft />

      {/* Spacer that grows/shrinks depending on sidebar state */}
      {/* <div className="flex-1"></div> */}

      {/* Right side with actions and user button */}
      <NavbarRight />
    </nav>
  );
}
