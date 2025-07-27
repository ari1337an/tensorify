import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Plugin } from "@/server/database/prisma/generated/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function groupPluginsByBase(plugins: Plugin[]) {
  return plugins.reduce(
    (acc, plugin) => {
      const baseSlug = plugin.slug.split(":")[0];
      if (!acc[baseSlug]) {
        acc[baseSlug] = [];
      }
      acc[baseSlug].push(plugin);
      return acc;
    },
    {} as Record<string, Plugin[]>
  );
}
