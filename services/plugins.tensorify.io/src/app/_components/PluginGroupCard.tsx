import { Plugin } from "@prisma/client";
import Link from "@/app/_components/ui/link";
import { Package, GitBranch, Calendar, Lock, Globe } from "lucide-react";

interface PluginGroupCardProps {
  baseSlug: string;
  versions: Plugin[];
}

export function PluginGroupCard({ baseSlug, versions }: PluginGroupCardProps) {
  // Sort versions by creation date, newest first
  const sortedVersions = [...versions].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
  const latestVersion = sortedVersions[0];
  const totalVersions = versions.length;

  return (
    <div
      className="bg-card rounded-xl border border-border overflow-hidden transition-all hover:shadow-lg"
      data-testid="plugin-group-card"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-semibold text-foreground">
                {latestVersion.name}
              </h2>
              <span
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  latestVersion.isPublic
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-amber-500/10 text-amber-500"
                }`}
              >
                {latestVersion.isPublic ? (
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
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>{baseSlug}</span>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground mb-6 line-clamp-2">
          {latestVersion.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GitBranch className="h-4 w-4" />
              <span>{totalVersions} versions</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(latestVersion.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <Link
            href={`/plugins/${latestVersion.slug}`}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            data-testid="view-latest-button"
          >
            View Latest
          </Link>
        </div>
      </div>

      {totalVersions > 1 && (
        <div className="border-t border-border bg-muted/50 px-6 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Recent versions:</span>
            <div className="flex gap-3">
              {sortedVersions.slice(0, 3).map((version) => (
                <Link
                  key={version.id}
                  href={`/plugins/${version.slug}`}
                  className="text-primary hover:underline"
                >
                  {version.slug.split(":")[1]}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
