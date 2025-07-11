"use client";

import { useEffect, useRef } from 'react';
import { OpenAPIV3 } from 'openapi-types';

interface SwaggerUIProps {
  spec: OpenAPIV3.Document;
}

export default function SwaggerUI({ spec }: SwaggerUIProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSwaggerUI = async () => {
      if (!containerRef.current) return;

      try {
        // Dynamically import SwaggerUIBundle with proper typing
        const SwaggerUIBundle = (await import('swagger-ui-dist/swagger-ui-bundle.js')).default;
        
        // Clear the container
        containerRef.current.innerHTML = '';

        // Initialize Swagger UI
        SwaggerUIBundle({
          spec: spec,
          dom_id: '#swagger-ui-container',
          deepLinking: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIBundle.presets.standalone
          ],
          plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
          ],
          docExpansion: 'list',
          operationsSorter: 'alpha',
          tagsSorter: 'alpha',
          filter: true,
          tryItOutEnabled: true,
          requestInterceptor: (request: Record<string, unknown>) => {
            // Add authentication if available
            if (typeof window !== 'undefined') {
              const token = localStorage.getItem('clerk-db-jwt') || sessionStorage.getItem('clerk-db-jwt');
              if (token && request.headers && typeof request.headers === 'object') {
                (request.headers as Record<string, string>).Authorization = `Bearer ${token}`;
              }
            }
            return request;
          },
          responseInterceptor: (response: Record<string, unknown>) => {
            return response;
          },
          onComplete: () => {
            console.log('Swagger UI loaded successfully');
          }
        });
      } catch (error) {
        console.error('Failed to load Swagger UI:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="swagger-error">
              <h3>Failed to load API documentation</h3>
              <p>There was an error loading the interactive API documentation. Please refresh the page.</p>
              <button onclick="window.location.reload()" class="reload-btn">Reload Page</button>
            </div>
          `;
        }
      }
    };

    loadSwaggerUI();
  }, [spec]);

  return (
    <>
      <style jsx global>{`
        /* Reset and base styles */
        #swagger-ui-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          background: #ffffff;
          color: #1a202c;
        }

        /* Hide the top bar */
        .swagger-ui .topbar {
          display: none !important;
        }

        /* Info section styling */
        .swagger-ui .info {
          margin: 0 0 30px 0;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          color: white;
        }

        .swagger-ui .info .title {
          color: white !important;
          font-size: 32px !important;
          font-weight: 700 !important;
          margin-bottom: 12px !important;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .swagger-ui .info .description p {
          color: rgba(255, 255, 255, 0.9) !important;
          font-size: 16px !important;
          line-height: 1.6 !important;
          margin: 0 !important;
        }

        /* Server selection */
        .swagger-ui .servers {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          margin: 20px 0;
        }

        .swagger-ui .servers-title {
          font-weight: 600;
          color: #1a202c;
          margin-bottom: 8px;
        }

        /* Operation blocks */
        .swagger-ui .opblock {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          margin-bottom: 20px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          background: white;
        }

        .swagger-ui .opblock:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }

        .swagger-ui .opblock.opblock-get {
          border-left: 4px solid #10b981;
        }

        .swagger-ui .opblock.opblock-post {
          border-left: 4px solid #3b82f6;
        }

        .swagger-ui .opblock.opblock-put {
          border-left: 4px solid #f59e0b;
        }

        .swagger-ui .opblock.opblock-delete {
          border-left: 4px solid #ef4444;
        }

        /* Operation summary */
        .swagger-ui .opblock-summary {
          padding: 20px 24px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 1px solid #f1f5f9;
        }

        .swagger-ui .opblock-summary:hover {
          background: #fafbfc;
        }

        .swagger-ui .opblock-summary-method {
          font-weight: 700;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.5px;
          min-width: 80px;
          display: inline-block;
          text-align: center;
          padding: 6px 12px;
          border-radius: 6px;
          color: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .swagger-ui .opblock.opblock-get .opblock-summary-method {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .swagger-ui .opblock.opblock-post .opblock-summary-method {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
        }

        .swagger-ui .opblock.opblock-put .opblock-summary-method {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .swagger-ui .opblock.opblock-delete .opblock-summary-method {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }

        .swagger-ui .opblock-summary-path {
          font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
          font-weight: 600;
          font-size: 16px;
          color: #1a202c;
          margin-left: 16px;
        }

        .swagger-ui .opblock-summary-description {
          color: #64748b;
          font-size: 14px;
          margin-left: 112px;
          margin-top: 6px;
          line-height: 1.5;
        }

        /* Tags */
        .swagger-ui .opblock-tag {
          font-size: 24px;
          font-weight: 700;
          color: #1a202c;
          margin: 40px 0 24px 0;
          padding: 16px 0;
          border-bottom: 3px solid #e2e8f0;
          background: linear-gradient(90deg, #1a202c 0%, #64748b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Parameters */
        .swagger-ui .parameters-container {
          background: #f8fafc;
          padding: 24px;
          border-top: 1px solid #e2e8f0;
        }

        .swagger-ui .parameter__name {
          font-weight: 600;
          color: #1a202c;
          font-size: 14px;
        }

        .swagger-ui .parameter__type {
          color: #7c3aed;
          font-weight: 600;
          font-size: 12px;
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
        }

        .swagger-ui .parameter__deprecated {
          text-decoration: line-through;
          opacity: 0.6;
        }

        /* Input styling */
        .swagger-ui input[type=text],
        .swagger-ui input[type=email],
        .swagger-ui input[type=password],
        .swagger-ui textarea,
        .swagger-ui select {
          border: 2px solid #d1d5db;
          border-radius: 8px;
          padding: 12px 16px;
          font-size: 14px;
          transition: all 0.2s ease;
          background: white;
          color: #1a202c;
        }

        .swagger-ui input[type=text]:focus,
        .swagger-ui input[type=email]:focus,
        .swagger-ui input[type=password]:focus,
        .swagger-ui textarea:focus,
        .swagger-ui select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* Execute button */
        .swagger-ui .btn.execute {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .swagger-ui .btn.execute:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .swagger-ui .btn.execute:active {
          transform: translateY(0);
        }

        /* Clear button */
        .swagger-ui .btn.clear {
          background: #6b7280;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 12px;
          margin-left: 8px;
          transition: all 0.2s ease;
        }

        .swagger-ui .btn.clear:hover {
          background: #4b5563;
        }

        /* Response section */
        .swagger-ui .responses-wrapper {
          background: white;
          padding: 24px;
          border-top: 1px solid #e2e8f0;
        }

        .swagger-ui .response-col_status {
          font-weight: 600;
          font-size: 14px;
          color: #1a202c;
        }

        .swagger-ui .response-col_description {
          color: #64748b;
          line-height: 1.5;
        }

        /* Code blocks */
        .swagger-ui pre {
          background: #1e293b !important;
          color: #f1f5f9 !important;
          border: 1px solid #334155 !important;
          border-radius: 8px !important;
          padding: 20px !important;
          font-family: 'Monaco', 'Menlo', 'Consolas', monospace !important;
          font-size: 13px !important;
          overflow-x: auto !important;
          line-height: 1.6 !important;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1) !important;
        }

        .swagger-ui .highlight-code {
          background: #1e293b !important;
        }

        /* Copy button */
        .swagger-ui .copy-to-clipboard {
          background: #475569;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 11px;
          position: absolute;
          top: 12px;
          right: 12px;
          transition: all 0.2s ease;
        }

        .swagger-ui .copy-to-clipboard:hover {
          background: #334155;
        }

        /* FIXED: Models and Schema section - Much Better Visibility */
        .swagger-ui .models {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 0;
          margin: 24px 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .swagger-ui .models-control {
          padding: 20px 24px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-bottom: 1px solid #e2e8f0;
          border-radius: 12px 12px 0 0;
        }

        .swagger-ui .models-control span {
          font-size: 18px !important;
          font-weight: 700 !important;
          color: #1a202c !important;
        }

        .swagger-ui .model-container {
          background: white;
          border-radius: 0 0 12px 12px;
          padding: 0;
        }

        .swagger-ui .model-box {
          background: #ffffff !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 8px !important;
          padding: 20px !important;
          margin: 16px !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
          transition: all 0.2s ease !important;
        }

        .swagger-ui .model-box:hover {
          border-color: #3b82f6 !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1) !important;
        }

        .swagger-ui .model-title {
          font-weight: 700 !important;
          color: #1a202c !important;
          font-size: 18px !important;
          margin-bottom: 16px !important;
          padding-bottom: 8px !important;
          border-bottom: 2px solid #e2e8f0 !important;
        }

        /* Schema properties */
        .swagger-ui .property-row {
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 12px 0 !important;
          display: flex !important;
          align-items: flex-start !important;
          gap: 12px !important;
        }

        .swagger-ui .property-row:last-child {
          border-bottom: none !important;
        }

        .swagger-ui .prop-name {
          font-weight: 600 !important;
          color: #1a202c !important;
          font-size: 14px !important;
          min-width: 120px !important;
          font-family: 'Monaco', 'Menlo', 'Consolas', monospace !important;
        }

        .swagger-ui .prop-type {
          color: #7c3aed !important;
          font-weight: 600 !important;
          font-size: 12px !important;
          background: #f3f4f6 !important;
          padding: 4px 8px !important;
          border-radius: 4px !important;
          border: 1px solid #e5e7eb !important;
          font-family: 'Monaco', 'Menlo', 'Consolas', monospace !important;
        }

        .swagger-ui .prop-format {
          color: #059669 !important;
          font-size: 12px !important;
          background: #ecfdf5 !important;
          padding: 2px 6px !important;
          border-radius: 3px !important;
          margin-left: 8px !important;
        }

        .swagger-ui .markdown p {
          color: #64748b !important;
          font-size: 14px !important;
          line-height: 1.5 !important;
          margin: 4px 0 !important;
        }

        /* Required indicators */
        .swagger-ui .required {
          color: #dc2626 !important;
          font-weight: 600 !important;
        }

        .swagger-ui .required:after {
          content: " *" !important;
          color: #dc2626 !important;
        }

        /* Model toggle */
        .swagger-ui .model-toggle {
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 6px !important;
          padding: 8px 12px !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          color: #475569 !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
        }

        .swagger-ui .model-toggle:hover {
          background: #e2e8f0 !important;
          color: #1a202c !important;
        }

        /* Example values */
        .swagger-ui .example {
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 6px !important;
          padding: 16px !important;
          margin: 12px 0 !important;
          font-family: 'Monaco', 'Menlo', 'Consolas', monospace !important;
          font-size: 13px !important;
          color: #1a202c !important;
          line-height: 1.5 !important;
        }

        /* Authentication */
        .swagger-ui .auth-wrapper {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 1px solid #f59e0b;
          border-radius: 12px;
          padding: 20px;
          margin: 24px 0;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.1);
        }

        .swagger-ui .auth-wrapper .auth-container h4 {
          color: #92400e;
          font-weight: 700;
          margin-bottom: 12px;
          font-size: 16px;
        }

        /* Loading and error states */
        .swagger-error {
          text-align: center;
          padding: 40px 20px;
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          border: 1px solid #fecaca;
          border-radius: 12px;
          margin: 20px 0;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
        }

        .swagger-error h3 {
          color: #dc2626;
          margin-bottom: 12px;
          font-size: 18px;
          font-weight: 600;
        }

        .swagger-error p {
          color: #7f1d1d;
          margin-bottom: 16px;
          line-height: 1.5;
        }

        .reload-btn {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }

        .reload-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(220, 38, 38, 0.4);
        }

        /* Table styling for better schema display */
        .swagger-ui table {
          border-collapse: separate !important;
          border-spacing: 0 !important;
          width: 100% !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
          overflow: hidden !important;
        }

        .swagger-ui table thead {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
        }

        .swagger-ui table th {
          padding: 16px 12px !important;
          font-weight: 600 !important;
          color: #1a202c !important;
          font-size: 14px !important;
          border-bottom: 1px solid #e2e8f0 !important;
          text-align: left !important;
        }

        .swagger-ui table td {
          padding: 12px !important;
          border-bottom: 1px solid #f1f5f9 !important;
          color: #374151 !important;
          vertical-align: top !important;
        }

        .swagger-ui table tr:last-child td {
          border-bottom: none !important;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .swagger-ui .opblock-summary-path {
            margin-left: 0;
            margin-top: 8px;
            display: block;
            font-size: 14px;
          }

          .swagger-ui .opblock-summary-description {
            margin-left: 0;
            margin-top: 8px;
          }

          .swagger-ui .parameters-container {
            padding: 16px;
          }

          .swagger-ui .responses-wrapper {
            padding: 16px;
          }

          .swagger-ui .model-box {
            margin: 8px !important;
            padding: 16px !important;
          }

          .swagger-ui .opblock-tag {
            font-size: 20px;
            margin: 24px 0 16px 0;
          }
        }

        /* Dark mode support - Enhanced */
        @media (prefers-color-scheme: dark) {
          #swagger-ui-container {
            background: #0f172a;
            color: #f1f5f9;
          }

          .swagger-ui .opblock {
            background: #1e293b;
            border-color: #334155;
          }

          .swagger-ui .opblock-summary {
            background: #1e293b;
            color: #f1f5f9;
            border-color: #334155;
          }

          .swagger-ui .opblock-summary:hover {
            background: #334155;
          }

          .swagger-ui .opblock-tag {
            color: #f1f5f9;
            border-color: #334155;
          }

          .swagger-ui .parameters-container {
            background: #0f172a;
          }

          .swagger-ui .responses-wrapper {
            background: #1e293b;
            border-color: #334155;
          }

          .swagger-ui .model-box {
            background: #1e293b !important;
            border-color: #334155 !important;
          }

          .swagger-ui .model-title {
            color: #f1f5f9 !important;
            border-color: #334155 !important;
          }

          .swagger-ui .prop-name {
            color: #f1f5f9 !important;
          }

          .swagger-ui .prop-type {
            background: #334155 !important;
            border-color: #475569 !important;
            color: #a78bfa !important;
          }

          .swagger-ui .servers {
            background: #0f172a;
            border-color: #334155;
          }

          .swagger-ui table th {
            background: #1e293b !important;
            color: #f1f5f9 !important;
            border-color: #334155 !important;
          }

          .swagger-ui table td {
            border-color: #334155 !important;
            color: #cbd5e1 !important;
          }

          .swagger-ui .example {
            background: #1e293b !important;
            border-color: #334155 !important;
            color: #f1f5f9 !important;
          }

          .swagger-ui .models-control {
            background: #1e293b !important;
            border-color: #334155 !important;
          }

          .swagger-ui .models-control span {
            color: #f1f5f9 !important;
          }

          .swagger-ui input[type=text],
          .swagger-ui input[type=email],
          .swagger-ui input[type=password],
          .swagger-ui textarea,
          .swagger-ui select {
            background: #1e293b;
            border-color: #475569;
            color: #f1f5f9;
          }

          .swagger-ui input[type=text]:focus,
          .swagger-ui input[type=email]:focus,
          .swagger-ui input[type=password]:focus,
          .swagger-ui textarea:focus,
          .swagger-ui select:focus {
            border-color: #3b82f6;
            background: #334155;
          }
        }
      `}</style>
      <div id="swagger-ui-container" ref={containerRef}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          fontSize: '16px',
          color: '#64748b'
        }}>
          Loading API documentation...
        </div>
      </div>
    </>
  );
} 