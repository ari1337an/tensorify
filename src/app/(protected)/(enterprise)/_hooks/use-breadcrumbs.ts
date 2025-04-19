import { useEffect } from "react";
import { usePathname } from "next/navigation";
import useStore from "@enterprise/_store/store";

const routeLabels: Record<string, string> = {
  dashboard: "Control Panel",
  canvas: "Canvas",
};

export function useBreadcrumbs() {
  const pathname = usePathname();
  const { setBreadcrumbs } = useStore();

  useEffect(() => {
    const segments = pathname.split("/").filter(Boolean);

    const breadcrumbItems = segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join("/")}`;
      const label =
        routeLabels[segment] ||
        segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

      return { label, path };
    });

    setBreadcrumbs(breadcrumbItems);
  }, [pathname, setBreadcrumbs]);
}
