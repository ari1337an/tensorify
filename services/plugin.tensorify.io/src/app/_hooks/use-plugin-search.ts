import { useQuery } from "@tanstack/react-query";

export function usePluginSearch(query: string) {
  return useQuery({
    queryKey: ["plugin-search", query],
    queryFn: async () => {
      if (!query.trim()) return { plugins: [] };
      const response = await fetch(`/api/plugins/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Failed to search plugins");
      return response.json();
    },
    enabled: query.length > 0,
  });
} 