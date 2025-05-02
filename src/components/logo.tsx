// import Link from "next/link";
// import Image from "next/image";

// interface LogoProps {
//   className?: string;
// }

// export default function Logo({ className }: LogoProps) {
//   return (
//     <Link href="/" className={className}>
//       <div className="flex items-center gap-2">
//         <Image
//           src="/tensorify-logo.svg"
//           alt="Tensorify Logo"
//           width={32}
//           height={32}
//           priority
//           className="h-8 w-8"
//         />
//         <span className="text-lg font-semibold tracking-tight">
//           <span className="bg-gradient-to-r from-purple-400 to-fuchsia-500 bg-clip-text text-transparent">
//             Tensorify
//           </span>
//           <span className="text-zinc-400">.io</span>
//         </span>
//       </div>
//     </Link>
//   );
// }

import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <Image
        src="/tensorify-logo-text.svg"
        alt="Tensorify Logo"
        width={164}
        height={35}
        priority
        className="h-7 md:h-9 w-auto" // Increased height slightly
      />
    </Link>
  );
}