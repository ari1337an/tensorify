/**
 * Parses the current route into breadcrumb segments.
 * If the route is too long, it collapses the middle parts with "...".
 */
export const getBreadcrumbSegments = (
  route: string
): { name: string; path: string }[] => {
  const parts = route.split("/").filter(Boolean); // Remove empty parts
  const segments: { name: string; path: string }[] = [];

  let accumulatedPath = "";

  parts.forEach((part) => {
    accumulatedPath += `/${part}`;
    segments.push({ name: part, path: accumulatedPath });
  });

  // Show full path if there are only two or fewer segments
  if (segments.length <= 2) {
    return segments;
  }

  // Keep only the first, last two, and replace the middle with "..."
  return [{ name: "...", path: "" }, ...segments.slice(-2)];
};
