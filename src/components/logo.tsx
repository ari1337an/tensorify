import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/">
      <div className="font-extrabold text-2xl">
        <div className="flex flex-row">
          <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent animate-gradient">
            Tensorify
          </span>
          <span className="bg-gradient-to-r from-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            .io
          </span>
        </div>
      </div>
    </Link>
  );
}
