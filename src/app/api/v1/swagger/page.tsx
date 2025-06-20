"use client";

import nextDynamic from "next/dynamic";
import { Suspense } from "react";

// Import styles before dynamic import
import "swagger-ui-react/swagger-ui.css";
import "./swagger-ui-dark.css";

const SwaggerUI = nextDynamic(() => import("swagger-ui-react"), {
  ssr: false,
  loading: () => <div>Loading Swagger UI...</div>,
});

// This prevents static generation
export const dynamic = "force-dynamic";

export default function OpenApiDocsPage() {
  return (
    <Suspense fallback={<div>Loading Swagger UI...</div>}>
      <SwaggerUI url="/api/v1/openapi.json" />
    </Suspense>
  );
}
