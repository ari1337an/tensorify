/**
 * CORS utilities for handling cross-origin requests
 * Supports app.tensorify.io and its subdomains in production
 */

export interface CorsHeaders extends Record<string, string> {
  "Access-Control-Allow-Origin": string;
  "Access-Control-Allow-Methods": string;
  "Access-Control-Allow-Headers": string;
  "Access-Control-Allow-Credentials": string;
}

/**
 * Get CORS headers based on request origin
 * Supports dynamic subdomain handling for *.app.tensorify.io
 */
export function getCorsHeaders(
  request: Request,
  methods: string = "GET, OPTIONS"
): CorsHeaders {
  const origin = request.headers.get("origin");

  let allowedOrigin = "*";

  if (process.env.NODE_ENV === "production" && origin) {
    // Allow app.tensorify.io and any of its subdomains
    if (
      origin === "https://app.tensorify.io" ||
      origin.endsWith(".app.tensorify.io") ||
      origin === "https://backend.tensorify.io" ||
      origin.endsWith(".backend.tensorify.io")
    ) {
      allowedOrigin = origin;
    }
  } else if (process.env.NODE_ENV !== "production") {
    // In development, allow any origin
    allowedOrigin = origin || "*";
  }

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
  };
}

/**
 * Create an OPTIONS handler with proper CORS headers
 */
export function createOptionsHandler(methods: string = "GET, OPTIONS") {
  return function OPTIONS(request: Request) {
    const corsHeaders = getCorsHeaders(request, methods);
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  };
}
