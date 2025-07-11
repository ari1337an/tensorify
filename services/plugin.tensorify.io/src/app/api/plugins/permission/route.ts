import { NextRequest } from "next/server";

import db from "@/server/database/db";
import { NextResponse } from "next/server";

/**
 * This route is used to check if the user has permission to install the plugin.
 * It is used to prevent users from installing plugins that they do not have permission to install.
 *
 * example:
 * /api/plugins/permission?pluginSlug=@ari1337an/lol:1.0.1&username=ari1337an
 *
 * @param {NextRequest} request
 * @returns {NextResponse}
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pluginSlug = decodeURIComponent(searchParams.get("pluginSlug") || "");
  const username = searchParams.get("username");
  const authorUsernameFromPluginSlug = pluginSlug
    .split("/")[0]
    .replace("@", "");
  const isOwner = authorUsernameFromPluginSlug === username;

  if (!pluginSlug || !username) {
    return NextResponse.json(
      { status: "ERROR", error: "Missing pluginSlug or username" },
      { status: 400 }
    );
  }

  const plugin = await db.plugin.findUnique({
    where: {
      slug: pluginSlug,
    },
  });
  if (!plugin) {
    return NextResponse.json(
      { status: "ERROR", error: "Plugin not found" },
      { status: 404 }
    );
  }

  let hasPermission = false;

  if (plugin.isPublic) {
    hasPermission = true;
    return NextResponse.json({ status: "OK", hasPermission });
  } else {
    if (isOwner) {
      hasPermission = true;
      return NextResponse.json({ status: "OK", hasPermission });
    } else {
      hasPermission = false;
      return NextResponse.json({ status: "OK", hasPermission });
    }
  }
}
