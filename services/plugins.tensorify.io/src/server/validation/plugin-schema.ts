import { z } from "zod";

export const createPluginSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  githubUrl: z.string().url("Must be a valid URL"),
  status: z.string(),
  tags: z.string().optional(),
  tensorifyVersion: z.string(),
  version: z.string(),
  releaseTag: z.string().optional(),
  sha: z.string().optional(),
  isPublic: z.boolean().optional(),
  slug: z.string(),
});

export type CreatePluginInput = z.infer<typeof createPluginSchema>;
