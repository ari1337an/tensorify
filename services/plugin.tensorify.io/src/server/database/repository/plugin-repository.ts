import { Plugin, Prisma } from "@prisma/client";
import db from "../db";

export class PluginRepository {
  async create(data: Prisma.PluginCreateInput): Promise<Plugin> {
    return db.plugin.create({ data });
  }

  async findMany(query?: Prisma.PluginFindManyArgs): Promise<Plugin[]> {
    return db.plugin.findMany(query);
  }

  async findById(id: string): Promise<Plugin | null> {
    return db.plugin.findUnique({ where: { id } });
  }

  async delete(id: string): Promise<Plugin> {
    return db.plugin.delete({
      where: { id },
    });
  }
}
