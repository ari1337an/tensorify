import { Plugin, Prisma } from "@/server/database/prisma/generated/client";
import db from "../db";

export class PluginRepository {


  async findMany(query?: Prisma.PluginFindManyArgs): Promise<Plugin[]> {
    return db.plugin.findMany(query);
  }

  async findById(id: string): Promise<Plugin | null> {
    return db.plugin.findUnique({ where: { id } });
  }


}
