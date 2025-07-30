import {
  getPluginBySlug,
  getLatestPluginVersion,
  listPluginVersions,
} from "@/server/actions/plugin-actions";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import {
  ArrowLeft,
  Check,
  Package,
  Calendar,
  GitBranch,
  ArrowRight,
  Globe,
  Lock,
} from "lucide-react";
import Link from "@/app/_components/ui/link";
import { VersionSwitcher } from "@/app/_components/VersionSwitcher";
import { Suspense } from "react";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { CopyButton } from "@/app/_components/CopyButton";
import { MarkdownContent } from "@/app/_components/MarkdownContent";
import { getUserByUserId } from "@/server/actions/author-actions";
import { Metadata } from "next/types";

// Define type for generateMetadata params
type Props = {
  params: Promise<{
    slug: string[];
  }>;
};

// Metadata generation function for SEO
export async function generateMetadata(props: Props): Promise<Metadata> {
  const { params } = props;
  const { slug } = await params;

  // If no slug, return default metadata
  if (!slug || slug.length === 0) {
    return {
      title: "Plugin not found | Tensorify",
      description: "The plugin you're looking for could not be found.",
    };
  }

  const fullSlug = slug ? decodeURIComponent(slug.join("/")) : "";
  const baseSlug = fullSlug.split(":")[0];

  // Handle special cases (latest version, etc.)
  const latestVersion = await getLatestPluginVersion(baseSlug);

  // Get the plugin details
  const plugin = await getPluginBySlug(fullSlug);

  // If plugin not found, return generic metadata
  if (!plugin) {
    return {
      title: "Plugin not found | Tensorify",
      description: "The plugin you're looking for could not be found.",
    };
  }

  // Get tags for keywords
  const tags = plugin.tags
    ? plugin.tags.split(",").filter((tag) => tag.trim().length > 0)
    : [];

  const isLatest = latestVersion?.slug === plugin.slug;
  const versionDisplay = `v${plugin.version}`;

  // Extract author name from slug
  const authorName = plugin.slug.split("/")[0];

  // Format description properly for metadata
  const description = plugin.description
    ? plugin.description
    : `${plugin.name} - A Tensorify plugin by ${authorName}`;

  // Build canonical URL based on latest version
  const canonical = isLatest
    ? `https://plugins.tensorify.io/plugins/${baseSlug}:latest`
    : `https://plugins.tensorify.io/plugins/${plugin.slug}`;

  return {
    title: `${plugin.name} ${versionDisplay}`,
    description: description,
    keywords: [
      ...tags,
      "tensorify",
      "plugin",
      authorName,
      plugin.name,
      plugin.version,
    ],
    authors: [{ name: authorName }],
    openGraph: {
      title: `${plugin.name} - Tensorify Plugin`,
      description: description,
      url: canonical,
      type: "website",
      siteName: "Tensorify Plugins",
      images: [
        {
          url: "https://plugins.tensorify.io/og-image.jpg", // Assuming a default OG image
          width: 1200,
          height: 630,
          alt: `${plugin.name} - Tensorify Plugin`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${plugin.name} - Tensorify Plugin`,
      description: description,
      images: ["https://plugins.tensorify.io/og-image.jpg"], // Same as OG image
    },
    alternates: {
      canonical: canonical,
    },
    metadataBase: new URL("https://plugins.tensorify.io"),
  };
}

function InstallationSkeleton() {
  return (
    <div className="space-y-4">
      {/* Installation Card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  {i === 2 && <Skeleton className="h-10 w-full mt-2" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-6">
          <Skeleton className="h-6 w-24 mb-4" />
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-16 mb-1" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div>
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VersionSwitcherSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-7 w-[120px] rounded-md" />
      <div className="flex items-center gap-1">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

function PluginContentSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-9 w-36" />
        </div>
      </div>
    </div>
  );
}

async function ReadmeContent({
  plugin,
}: {
  plugin: { readme?: string | null };
}) {
  const readmeContent = plugin.readme || "No README available for this plugin.";
  return <MarkdownContent content={readmeContent} />;
}

// TimeAgo component to display relative time
function TimeAgo({ date }: { date: Date | string }) {
  const timeAgo = getTimeAgo(new Date(date));
  return <span>{timeAgo}</span>;
}

// Function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""} ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? "s" : ""} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears !== 1 ? "s" : ""} ago`;
}

export default async function PluginPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { userId } = await auth();
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    notFound();
  }
  if (slug && slug.length == 1 && decodeURIComponent(slug[0]).startsWith("@")) {
    redirect(`/authors/${slug[0]}`);
  }
  if (slug && slug.length == 1) {
    notFound();
  }
  const fullSlug = slug ? decodeURIComponent(slug.join("/")) : "";
  const baseSlug = fullSlug.split(":")[0];

  // Get all versions and check if current is latest
  const latestVersion = await getLatestPluginVersion(baseSlug);
  const allVersions = await listPluginVersions(baseSlug);
  const isLatest = latestVersion?.slug === fullSlug;

  // Redirect to latest version if :latest specified
  if (fullSlug.endsWith(":latest")) {
    if (latestVersion) {
      redirect(`/plugins/${latestVersion.slug}`);
    }
  }

  // Redirect to latest version if no version specified
  if (!fullSlug.includes(":")) {
    if (latestVersion) {
      redirect(`/plugins/${latestVersion.slug}`);
    }
  }

  const plugin = await getPluginBySlug(fullSlug);
  if (!plugin) {
    notFound();
  }

  // Check if user owns this plugin
  const userObject = await getUserByUserId(userId || "");

  let isOwner = false;

  if (userObject?.username) {
    isOwner = userObject.username === plugin.authorName;
  } else {
    isOwner = userId === plugin.authorId;
  }

  const isPublic = plugin.isPublic;

  const isPublished = plugin.status === "published";

  // public + unpublished + !isOwner -> 404
  // private + published + !isOwner -> 404
  // private + unpublished + !isOwner -> 404
  if (isPublic && !isPublished && !isOwner) notFound();
  if (!isPublic && isPublished && !isOwner) notFound();
  if (!isPublic && !isPublished && !isOwner) notFound();

  const tags = plugin.tags
    ? plugin.tags.split(",").filter((tag) => tag.trim().length > 0)
    : [];
  const authorName = plugin.slug.split("/")[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      {/* Premium Hero Section with Multiple Layers */}
      <div className="absolute inset-x-0 top-0 h-[40rem] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/[0.02] to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-20%,rgba(var(--primary-rgb),0.08),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_400px_at_100%_200px,rgba(var(--primary-rgb),0.04),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_400px_at_0%_300px,rgba(var(--primary-rgb),0.03),transparent)]" />
      </div>

      <div className="container relative mx-auto px-4 py-12">
        {/* Floating Back Button */}
        <Link
          href="/dashboard"
          className="group inline-flex items-center gap-2.5 text-muted-foreground/80 hover:text-foreground 
                   transition-all duration-300 mb-12 hover:bg-card/40 py-2.5 px-5 rounded-xl
                   border border-border/40 hover:border-border/80 backdrop-blur-sm
                   shadow-[0_0_1px_rgba(0,0,0,0.1)] hover:shadow-[0_0_15px_rgba(0,0,0,0.1)]"
        >
          <ArrowLeft className="h-4 w-4 transition-all duration-300 group-hover:-translate-x-1" />
          <span className="font-medium">Back to Dashboard</span>
        </Link>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Plugin Info Card */}
            <div
              className="group relative bg-card/40 hover:bg-card/50 backdrop-blur-xl 
                           border border-border/40 rounded-xl overflow-hidden 
                           shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)]
                           ring-1 ring-border/5 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-8 relative">
                <Suspense fallback={<PluginContentSkeleton />}>
                  <div className="space-y-8">
                    {/* Enhanced Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                      <div className="space-y-4 w-full sm:w-auto">
                        <div className="flex items-center gap-4">
                          <h1
                            data-testid="plugin-name"
                            className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent"
                          >
                            {plugin.name}
                          </h1>
                          {/* Visibility Badge */}
                          <span
                            className={`flex items-center gap-1 text-sm px-2.5 py-1 rounded-full ${
                              plugin.isPublic
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-amber-500/10 text-amber-500"
                            }`}
                          >
                            {plugin.isPublic ? (
                              <>
                                <Globe className="h-4 w-4" />
                                <span data-testid="plugin-visibility-badge">
                                  Public
                                </span>
                              </>
                            ) : (
                              <>
                                <Lock className="h-4 w-4" />
                                <span data-testid="plugin-visibility-badge">
                                  Private
                                </span>
                              </>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Package className="h-4 w-4" />
                          <span data-testid="plugin-base-slug">{baseSlug}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Suspense>
              </div>
            </div>

            {/* README Content with enhanced styling */}
            {plugin.status === "published" ? (
              <div
                className="group relative bg-card/40 hover:bg-card/50 backdrop-blur-xl 
                             border border-border/40 rounded-xl overflow-hidden
                             shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)]
                             ring-1 ring-border/5 transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-8 relative">
                  <h2 className="text-xl font-semibold mb-8 flex items-center gap-3">
                    <div className="h-8 w-1 bg-gradient-to-b from-primary via-primary/80 to-primary/30 rounded-full group-hover:from-primary/80 group-hover:to-primary/50 transition-colors duration-300" />
                    <span className="bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent">
                      Documentation
                    </span>
                  </h2>
                  <Suspense
                    fallback={<Skeleton className="h-64 w-full rounded-xl" />}
                  >
                    <ReadmeContent plugin={plugin} />
                  </Suspense>
                </div>
              </div>
            ) : null}
          </div>

          {/* Sidebar with Premium Cards */}
          <div className="relative lg:h-[calc(100vh-8rem)]">
            <div className="space-y-8 sticky top-8">
              <Suspense fallback={<InstallationSkeleton />}>
                {/* Installation Card */}
                {plugin.status === "published" && (
                  <div
                    className="group relative bg-card/40 hover:bg-card/50 backdrop-blur-xl 
                               border border-border/40 rounded-xl overflow-hidden
                               shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)]
                               ring-1 ring-border/5 transition-all duration-500"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="p-6 relative">
                      <h2 className="text-xl font-semibold mb-8 flex items-center gap-3">
                        <div className="h-8 w-1 bg-gradient-to-b from-primary via-primary/80 to-primary/30 rounded-full group-hover:from-primary/80 group-hover:to-primary/50 transition-colors duration-300" />
                        <span className="bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent">
                          Installation
                        </span>
                      </h2>

                      <ol className="space-y-6 text-sm">
                        <li className="flex gap-4 group/step">
                          <span
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full
                                        bg-gradient-to-br from-primary/20 to-primary/10
                                        border border-primary/20 text-xs font-medium text-primary
                                        shadow-[0_2px_10px_-2px_rgba(var(--primary-rgb),0.2)]
                                        transition-all duration-300
                                        group-hover/step:shadow-[0_4px_15px_-2px_rgba(var(--primary-rgb),0.3)]"
                          >
                            1
                          </span>
                          <span className="pt-1">
                            Go to &quot;Install Plugins&quot; in your Tensorify
                            dashboard
                          </span>
                        </li>

                        <li className="flex gap-4 group/step">
                          <span
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full
                                          bg-gradient-to-br from-primary/20 to-primary/10
                                          border border-primary/20 text-xs font-medium text-primary
                                          shadow-[0_2px_10px_-2px_rgba(var(--primary-rgb),0.2)]
                                          transition-all duration-300
                                          group-hover/step:shadow-[0_4px_15px_-2px_rgba(var(--primary-rgb),0.3)]"
                          >
                            2
                          </span>
                          <div className="flex-1">
                            <span>Enter the plugin identifier:</span>
                            <div className="mt-2 flex items-center gap-2 bg-muted/30 hover:bg-muted/50 rounded-lg p-1.5 transition-colors duration-300 group border border-border/50">
                              <code className="flex-1 px-3 py-1.5 text-sm font-mono text-foreground">
                                {isLatest
                                  ? plugin.slug.split(":")[0] + ":latest"
                                  : plugin.slug}
                              </code>
                              <CopyButton text={plugin.slug} />
                            </div>
                          </div>
                        </li>

                        <li className="flex gap-4 group/step">
                          <span
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full
                                          bg-gradient-to-br from-primary/20 to-primary/10
                                          border border-primary/20 text-xs font-medium text-primary
                                          shadow-[0_2px_10px_-2px_rgba(var(--primary-rgb),0.2)]
                                          transition-all duration-300
                                          group-hover/step:shadow-[0_4px_15px_-2px_rgba(var(--primary-rgb),0.3)]"
                          >
                            3
                          </span>
                          <span className="pt-1">
                            Click &quot;Install&quot; to complete installation
                          </span>
                        </li>
                      </ol>
                    </div>
                  </div>
                )}

                {/* Details Section with matching enhancements */}
                <div
                  className="group relative bg-card/40 hover:bg-card/50 backdrop-blur-xl 
                               border border-border/40 rounded-xl overflow-hidden
                               shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)]
                               ring-1 ring-border/5 transition-all duration-500"
                >
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-8 flex items-center gap-3">
                      <div className="h-8 w-1 bg-gradient-to-b from-primary via-primary/80 to-primary/30 rounded-full group-hover:from-primary/80 group-hover:to-primary/50 transition-colors duration-300" />
                      <span className="bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent">
                        Plugin Details
                      </span>
                    </h2>
                    <dl className="space-y-6">
                      {/* Version Info Group */}
                      <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                        <dt className="text-sm} text-muted-foreground mb-3">
                          Version
                        </dt>
                        <dd>
                          <div className="flex items-center gap-3">
                            <Suspense fallback={<VersionSwitcherSkeleton />}>
                              <VersionSwitcher
                                currentVersion={plugin.version}
                                versions={allVersions}
                                isOwner={isOwner}
                              />
                            </Suspense>
                            {isLatest && (
                              <div className="flex items-center gap-1 bg-green-500/10 text-green-500 px-2 py-1 rounded-full text-xs font-medium">
                                <Check className="h-3.5 w-3.5" />
                                Latest
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
                            <GitBranch className="h-3.5 w-3.5" />
                            <span>{allVersions.length} versions available</span>
                          </div>
                        </dd>
                      </div>

                      {/* Description */}
                      <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                        <dt className="text-sm text-muted-foreground mb-2">
                          Description
                        </dt>
                        <dd className="text-sm text-foreground">
                          {plugin.description}
                        </dd>
                      </div>

                      {/* Plugin Type */}
                      <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                        <dt className="text-sm text-muted-foreground mb-2">
                          Plugin Type
                        </dt>
                        <dd>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-md border border-primary/20">
                            <Package className="h-3.5 w-3.5" />
                            {plugin.pluginType
                              .split("_")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() +
                                  word.slice(1).toLowerCase()
                              )
                              .join(" ") || "Custom"}
                          </span>
                        </dd>
                      </div>

                      {/* Meta Info Group */}
                      <div className="bg-muted/30 rounded-lg p-4 border border-border/50 space-y-4">
                        <div>
                          <dt className="text-sm text-muted-foreground mb-2">
                            Author
                          </dt>
                          <dd>
                            <Link
                              href={`/authors/${authorName}`}
                              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                            >
                              {authorName}
                            </Link>
                          </dd>
                        </div>

                        <div>
                          <dt className="text-sm text-muted-foreground mb-2">
                            Published
                          </dt>
                          <dd className="flex items-center gap-2 text-sm text-foreground">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              <TimeAgo date={plugin.createdAt} />
                              <span className="text-xs text-muted-foreground ml-1.5">
                                (
                                {new Date(
                                  plugin.createdAt
                                ).toLocaleDateString()}
                                )
                              </span>
                            </span>
                          </dd>
                        </div>

                        <div>
                          <dt className="text-sm text-muted-foreground mb-2">
                            GitHub Repository
                          </dt>
                          <dd>
                            <a
                              href={plugin.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline inline-flex items-center gap-1.5"
                            >
                              View Source
                              <ArrowRight className="h-3.5 w-3.5" />
                            </a>
                          </dd>
                        </div>
                      </div>

                      {/* SDK Version */}
                      <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                        <dt className="text-sm text-muted-foreground mb-2">
                          Tensorify SDK Version
                        </dt>
                        <dd className="text-sm text-foreground">
                          {plugin.sdkVersion}
                        </dd>
                      </div>

                      {/* Status */}
                      <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                        <dt className="text-sm text-muted-foreground mb-2">
                          Status
                        </dt>
                        <dd className="text-sm text-foreground capitalize">
                          {plugin.status}
                        </dd>
                      </div>

                      {/* Tags */}
                      {tags.length > 0 && (
                        <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                          <dt className="text-sm text-muted-foreground mb-2">
                            Tags
                          </dt>
                          <dd className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                              >
                                {tag}
                              </span>
                            ))}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
