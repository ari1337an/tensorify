import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { listPluginsByUsername } from "@/server/actions/plugin-actions";
import { PluginGroupCard } from "../_components/PluginGroupCard";
import { groupPluginsByBase } from "@/lib/utils";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const user = await currentUser();
  if (!user?.username) redirect("/");

  // Get plugins by username
  const plugins = await listPluginsByUsername(user.username);
  const groupedPlugins = groupPluginsByBase(plugins);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Plugins</h1>
        <div className="text-sm text-muted-foreground">
          Upload plugins using the Tensorify CLI
        </div>
      </div>

      {plugins.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-testid="no-plugins-message"
        >
          <p>You haven&apos;t published any plugins yet.</p>
          <p className="mt-2">
            Use the Tensorify CLI to upload and publish your plugins.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(groupedPlugins).map(([baseSlug, versions]) => (
            <PluginGroupCard
              key={baseSlug}
              baseSlug={baseSlug}
              versions={versions}
            />
          ))}
        </div>
      )}
    </div>
  );
}
