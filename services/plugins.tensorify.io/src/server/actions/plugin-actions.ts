"use server";

import { auth } from "@clerk/nextjs/server";
import { PluginRepository } from "../database/repository/plugin-repository";
import { PluginUseCase } from "../usecases/plugin-usecase";
import { PrismaClient } from "@prisma/client";

const pluginUseCase = new PluginUseCase(new PluginRepository());
const prisma = new PrismaClient();

export async function listPlugins(userId?: string) {
  if (userId) {
    return pluginUseCase.listPluginsByUser(userId);
  }
  return pluginUseCase.listPlugins();
}

export async function getPluginById(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return pluginUseCase.getPluginById(id);
}

export async function getLatestPluginVersion(baseSlug: string) {
  const plugin = await prisma.plugin.findFirst({
    where: {
      slug: {
        startsWith: baseSlug,
      },
      status: "published",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return plugin;
}

export async function getPluginBySlug(slug: string) {
  // If no version specified, get the latest version
  if (!slug.includes(":")) {
    return getLatestPluginVersion(slug);
  }

  // If version is specified, get that specific version
  const plugin = await prisma.plugin.findUnique({
    where: { slug },
  });
  return plugin;
}

export async function listPluginVersions(baseSlug: string) {
  const plugins = await prisma.plugin.findMany({
    where: {
      slug: {
        startsWith: baseSlug,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return plugins;
}

export async function listPluginsByUsername(username: string) {
  const plugins = await prisma.plugin.findMany({
    where: {
      authorName: username,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return plugins;
}
