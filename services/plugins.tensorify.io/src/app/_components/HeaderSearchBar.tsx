"use client";

import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useDebounce } from "@/app/_hooks/use-debounce";
// import { usePluginSearch } from "@/app/_hooks/use-plugin-search";

export function HeaderSearchBar() {
  const [search, setSearch] = useState("");
  // const debouncedSearch = useDebounce(search, 300);
  // const { data, isLoading } = usePluginSearch(debouncedSearch);
  // const router = useRouter();

  return (
    <div className="relative">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search plugins..."
        className="w-full px-4 py-2 bg-secondary/50 rounded-lg"
      />
      {/* Add dropdown results similar to SearchDialog */}
    </div>
  );
} 