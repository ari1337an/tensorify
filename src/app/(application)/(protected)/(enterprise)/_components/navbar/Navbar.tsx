"use client";
import { NavbarLeft } from "@/app/(application)/(protected)/(enterprise)/_components/navbar/NavbarLeft";
import { NavbarRight } from "@/app/(application)/(protected)/(enterprise)/_components/navbar/NavbarRight";

export function Navbar() {
  return (
    <nav className="bg-background h-11 flex justify-between">
      {/* Left side with burger menu & breadcrumb */}
      <NavbarLeft />

      {/* Right side with actions and user button */}
      <NavbarRight />
    </nav>
  );
}
