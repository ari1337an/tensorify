import { Plugin } from "@prisma/client";
import Link from "@/app/_components/ui/link";
import { PluginStatusIndicator } from "./PluginStatusIndicator";
import { ProcessingStatus } from "@/server/models/plugin";
import { Lock, Globe } from "lucide-react";

interface PluginCardProps {
  plugin: Plugin;
  showViewButton?: boolean;
}

export default function PluginCard({
  plugin,
  showViewButton = true,
}: PluginCardProps) {
  return (
    <Link href={`/plugins/${plugin.slug}`} className="block">
      <div className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-border">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-card-foreground">
                {plugin.name}
              </h2>
              <span
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  plugin.isPublic
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-amber-500/10 text-amber-500"
                }`}
              >
                {plugin.isPublic ? (
                  <>
                    <Globe className="h-3 w-3" />
                    <span>Public</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3" />
                    <span>Private</span>
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-accent text-accent-foreground text-xs px-2.5 py-1 rounded-full">
                {plugin.status}
              </span>
              <PluginStatusIndicator
                processingStatus={plugin.processingStatus as ProcessingStatus}
              />
            </div>
          </div>
          <p className="text-muted-foreground mb-4">{plugin.description}</p>
          <div className="flex items-center justify-between">
            {showViewButton ? (
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                View
              </button>
            ) : (
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                Install Plugin
              </button>
            )}
            <div className="text-muted-foreground text-sm">
              {new Date(plugin.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
