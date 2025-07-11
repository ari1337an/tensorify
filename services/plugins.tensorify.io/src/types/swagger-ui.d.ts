declare module 'swagger-ui-dist/swagger-ui-bundle.js' {
  interface SwaggerUIBundleOptions {
    spec?: Record<string, unknown> | import('openapi-types').OpenAPIV3.Document;
    url?: string;
    dom_id?: string;
    domNode?: HTMLElement;
    deepLinking?: boolean;
    presets?: unknown[];
    plugins?: unknown[];
    docExpansion?: string;
    operationsSorter?: string;
    tagsSorter?: string;
    filter?: boolean;
    tryItOutEnabled?: boolean;
    requestInterceptor?: (request: Record<string, unknown>) => Record<string, unknown>;
    responseInterceptor?: (response: Record<string, unknown>) => Record<string, unknown>;
    onComplete?: () => void;
    [key: string]: unknown;
  }

  interface SwaggerUIBundle {
    (options: SwaggerUIBundleOptions): void;
    presets: {
      apis: unknown;
      standalone: unknown;
    };
    plugins: {
      DownloadUrl: unknown;
    };
  }

  const SwaggerUIBundle: SwaggerUIBundle;
  export default SwaggerUIBundle;
}

declare module 'swagger-ui-dist/swagger-ui-bundle' {
  export * from 'swagger-ui-dist/swagger-ui-bundle.js';
  export { default } from 'swagger-ui-dist/swagger-ui-bundle.js';
}

declare module 'swagger-ui-dist' {
  export * from 'swagger-ui-dist/swagger-ui-bundle.js';
  export { default } from 'swagger-ui-dist/swagger-ui-bundle.js';
}

// Additional CSS imports
declare module 'swagger-ui-dist/swagger-ui.css' {
  const content: string;
  export default content;
} 