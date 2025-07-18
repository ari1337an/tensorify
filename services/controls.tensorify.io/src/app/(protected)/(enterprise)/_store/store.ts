import { User } from "@clerk/nextjs/server";
import { create } from "zustand";

type RouteType = "Dashboard" | "Blog Posts" | "Pages" | "Media" | string;

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface StoreState {
  currentUser: User | null;
  currentRoute: RouteType;
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (items: BreadcrumbItem[]) => void;
  addBreadcrumb: (item: BreadcrumbItem) => void;
  clearBreadcrumbs: () => void;
}

const useStore = create<StoreState>((set) => ({
  currentUser: null,
  currentRoute: "Dashboard",
  breadcrumbs: [],
  setBreadcrumbs: (items) => set({ breadcrumbs: items }),
  addBreadcrumb: (item) =>
    set((state) => ({
      breadcrumbs: [...state.breadcrumbs, item],
    })),
  clearBreadcrumbs: () => set({ breadcrumbs: [] }),
}));

export default useStore;
