import React from "react";
import { Webhook, MessageCircle, Database } from "lucide-react";

export const nodeTypes = [
  {
    icon: <Webhook className="h-6 w-6 text-foreground" />,
    name: "Webhook",
    description: "Trigger workflow from a webhook.",
  },
  {
    icon: <MessageCircle className="h-6 w-6 text-foreground" />,
    name: "Send Message",
    description: "Send a message to a user or channel.",
  },
  {
    icon: <Database className="h-6 w-6 text-foreground" />,
    name: "Database Query",
    description: "Run a query on your connected database.",
  },
]; 