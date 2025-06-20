'use server';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import './swagger-ui-dark.css';

export default async function OpenApiDocsPage() {
  return <SwaggerUI url="/api/v1/openapi.json" />;
}