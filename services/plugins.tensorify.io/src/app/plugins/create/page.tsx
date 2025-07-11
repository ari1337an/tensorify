"use client";

import CreatePluginForm from "./CreatePluginForm";

export default function CreatePluginPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Create New Plugin
          </h1>
          <p className="text-muted-foreground text-lg">
            Create a new plugin by connecting to your GitHub repository and
            providing plugin details.
          </p>
        </div>
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
          <CreatePluginForm />
        </div>
      </div>
    </div>
  );
}
