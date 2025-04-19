import { User } from "@clerk/nextjs/server";
import { create } from "zustand";

type RouteType = "Dashboard" | "Blog Posts" | "Pages" | "Media" | string;

interface StoreState {
  currentUser: User | null;
  currentRoute: RouteType;
}

const useStore = create<StoreState>(() => ({
  currentUser: null,
  currentRoute: "Dashboard",
}));

export default useStore;
