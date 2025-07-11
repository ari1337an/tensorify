"use server";

import { notFound } from "next/navigation";
import PluginCard from "@/app/_components/PluginCard";
import { getAuthorDetails } from "@/server/actions/author-actions";
import { Plugin } from "@prisma/client";
import Image from "next/image";

interface PageProps {
  params: Promise<{ authorId: string }>;
}

export default async function AuthorPage({ params }: PageProps) {
  // Await the params first
  const { authorId } = await params;

  const author = await getAuthorDetails(authorId);

  if (!author) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Author Profile Section */}
        <div className="mb-12">
          <div
            className="group relative bg-card/40 hover:bg-card/50 backdrop-blur-xl 
                     border border-border/40 rounded-xl overflow-hidden
                     shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)]
                     ring-1 ring-border/5 transition-all duration-500 p-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center gap-6">
              {/* Author Avatar */}
              <div className="relative h-24 w-24">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/60 rounded-full blur-[2px]" />
                <Image
                  src={author.avatarUrl}
                  alt={author.username || "Author"}
                  className="relative rounded-full object-cover border-2 border-border"
                  fill
                  sizes="(max-width: 768px) 96px, 96px"
                  priority
                />
              </div>

              {/* Author Info */}
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {author.fullName || author.username || "Anonymous"}
                </h1>
                {author.username && author.fullName && (
                  <p className="text-muted-foreground mt-1">
                    @{author.username}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Plugins Grid */}
        <div>
          <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Published Plugins
          </h2>
          {author.plugins.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {author.plugins.map((plugin: Plugin) => (
                <PluginCard key={plugin.id} plugin={plugin} />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              No plugins published yet.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
