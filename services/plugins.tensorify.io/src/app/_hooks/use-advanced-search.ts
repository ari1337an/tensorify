import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "./use-debounce";

interface SearchParams {
  query: string;
  version: string;
  sortBy: string;
  tags: string[];
}

export function useAdvancedSearch(params: SearchParams) {
  const debouncedQuery = useDebounce(params.query, 300);

  return useQuery({
    queryKey: [
      "advanced-search",
      debouncedQuery,
      params.version,
      params.sortBy,
      params.tags,
    ],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (debouncedQuery) searchParams.set("q", debouncedQuery);
      if (params.version) searchParams.set("version", params.version);
      if (params.sortBy) searchParams.set("sortBy", params.sortBy);
      if (params.tags.length) searchParams.set("tags", params.tags.join(","));

      const response = await fetch(
        `/api/plugins/advanced-search?${searchParams}`
      );
      if (!response.ok) throw new Error("Failed to search plugins");
      return response.json();
    },
  });
}
