import { z } from "zod";

export const User = z.object({
  id: z.string(),
  name: z.string(),
});


export const PluginSlugSchema = z.string().regex(
  /^@[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+:[0-9]+\.[0-9]+\.[0-9]+$/,
  { message: "Invalid plugin slug format" }
);