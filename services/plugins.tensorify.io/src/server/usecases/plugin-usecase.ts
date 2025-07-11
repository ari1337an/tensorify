/* eslint-disable @typescript-eslint/no-unused-vars */
import { Plugin } from "@prisma/client";
import { PluginRepository } from "../database/repository/plugin-repository";

export class PluginUseCase {
  constructor(private pluginRepository: PluginRepository) {}

  async createPlugin(
    data: {
      name: string;
      description: string;
      githubUrl: string;
      status: string;
      tensorifyVersion: string;
      tags?: string;
      slug: string;
      authorName: string;
      authorId: string;
      processingStatus: string;
      sha?: string | null;
    },
    userId: string
  ): Promise<Plugin> {
    return this.pluginRepository.create(data);
  }

  async listPlugins(): Promise<Plugin[]> {
    return this.pluginRepository.findMany();
  }

  async getPluginById(id: string): Promise<Plugin | null> {
    return this.pluginRepository.findById(id);
  }

  async deletePlugin(id: string): Promise<Plugin> {
    return this.pluginRepository.delete(id);
  }

  async listPluginsByUser(userId: string): Promise<Plugin[]> {
    return this.pluginRepository.findMany({
      where: {
        authorId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}
