export type PluginStatus = "active" | "deprecated" | "beta";

export type ProcessingStatus = "queued" | "processing" | "published" | "failed";

export interface PluginError {
  message: string;
  code: string;
  timestamp: Date;
}
