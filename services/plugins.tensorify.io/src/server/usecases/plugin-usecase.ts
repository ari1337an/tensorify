import { Plugin } from "@/server/database/prisma/generated/client";
import { PluginRepository } from "../database/repository/plugin-repository";

export class PluginUseCase {
  constructor(private pluginRepository: PluginRepository) {}



  async listPlugins(): Promise<Plugin[]> {
    return this.pluginRepository.findMany();
  }

  async getPluginById(id: string): Promise<Plugin | null> {
    return this.pluginRepository.findById(id);
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
