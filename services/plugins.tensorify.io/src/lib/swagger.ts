import { OpenAPIV3 } from 'openapi-types';

export const openApiSpec: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'Tensorify Plugins API',
    version: '1.0.0',
    description: 'API for managing and distributing Tensorify plugins',
    contact: {
      name: 'Tensorify Team',
      url: 'https://tensorify.io',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production' 
        ? 'https://plugins.tensorify.io' 
        : 'http://localhost:3000',
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
    },
  ],
  tags: [
    {
      name: 'Plugin Distribution',
      description: 'Download and install plugins',
    },
    {
      name: 'Plugin Discovery',
      description: 'Search and browse plugins',
    },
    {
      name: 'Plugin Management',
      description: 'Manage plugin metadata and permissions',
    },
  ],
  paths: {
    '/api/plugins/{slug}/download': {
      get: {
        tags: ['Plugin Distribution'],
        summary: 'Download plugin bundle',
        description: 'Downloads a plugin as a ZIP bundle containing all plugin files',
        operationId: 'downloadPlugin',
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            description: 'Plugin slug in format @author/name:version',
            schema: {
              type: 'string',
              example: '@tensorify/math-utils:1.0.0',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Plugin bundle downloaded successfully',
            headers: {
              'Content-Type': {
                schema: {
                  type: 'string',
                  example: 'application/zip',
                },
              },
              'Content-Disposition': {
                schema: {
                  type: 'string',
                  example: 'attachment; filename="math-utils-1.0.0.zip"',
                },
              },
            },
            content: {
              'application/zip': {
                schema: {
                  type: 'string',
                  format: 'binary',
                },
              },
            },
          },
          '400': {
            description: 'Plugin not published or invalid request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Access denied to private plugin',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Plugin not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
          {},
        ],
      },
    },
    '/api/plugins/{slug}/manifest': {
      get: {
        tags: ['Plugin Distribution'],
        summary: 'Get plugin manifest',
        description: 'Returns complete plugin metadata, dependencies, and file structure',
        operationId: 'getPluginManifest',
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            description: 'Plugin slug in format @author/name:version',
            schema: {
              type: 'string',
              example: '@tensorify/math-utils:1.0.0',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Plugin manifest retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PluginManifest',
                },
              },
            },
          },
          '400': {
            description: 'Plugin not published',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Access denied to private plugin',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Plugin not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
          {},
        ],
      },
    },
    '/api/plugins/install': {
      post: {
        tags: ['Plugin Distribution'],
        summary: 'Install plugin',
        description: 'Validates and initiates plugin installation process',
        operationId: 'installPlugin',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/InstallRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Plugin installation initiated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/InstallResponse',
                },
              },
            },
          },
          '400': {
            description: 'Invalid request or plugin not available',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '401': {
            description: 'Authentication required',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Access denied to private plugin',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Plugin not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '409': {
            description: 'Version incompatibility',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/VersionIncompatibleResponse',
                },
              },
            },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    '/api/plugins/search': {
      get: {
        tags: ['Plugin Discovery'],
        summary: 'Search plugins',
        description: 'Search for plugins by name, description, author, or tags',
        operationId: 'searchPlugins',
        parameters: [
          {
            name: 'q',
            in: 'query',
            required: true,
            description: 'Search query',
            schema: {
              type: 'string',
              example: 'math utils',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Search results',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    plugins: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/PluginSearchResult',
                      },
                    },
                  },
                },
              },
            },
          },
          '500': {
            description: 'Search failed',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/plugins/advanced-search': {
      get: {
        tags: ['Plugin Discovery'],
        summary: 'Advanced plugin search',
        description: 'Advanced search with filtering and sorting options',
        operationId: 'advancedSearchPlugins',
        parameters: [
          {
            name: 'q',
            in: 'query',
            description: 'Search query',
            schema: {
              type: 'string',
            },
          },
          {
            name: 'sortBy',
            in: 'query',
            description: 'Sort order',
            schema: {
              type: 'string',
              enum: ['relevance', 'updated', 'newest', 'oldest'],
              default: 'relevance',
            },
          },
          {
            name: 'tags',
            in: 'query',
            description: 'Filter by tags (comma-separated)',
            schema: {
              type: 'string',
              example: 'math,utility',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Advanced search results',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    plugins: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/PluginDetailedResult',
                      },
                    },
                    total: {
                      type: 'integer',
                      description: 'Total number of results',
                    },
                  },
                },
              },
            },
          },
          '500': {
            description: 'Search failed',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/plugins/permission': {
      get: {
        tags: ['Plugin Management'],
        summary: 'Check plugin permissions',
        description: 'Check if a user has permission to install a specific plugin',
        operationId: 'checkPluginPermission',
        parameters: [
          {
            name: 'pluginSlug',
            in: 'query',
            required: true,
            description: 'Plugin slug to check',
            schema: {
              type: 'string',
              example: '@tensorify/math-utils:1.0.0',
            },
          },
          {
            name: 'username',
            in: 'query',
            required: true,
            description: 'Username to check permissions for',
            schema: {
              type: 'string',
              example: 'john_doe',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Permission check result',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['OK'],
                    },
                    hasPermission: {
                      type: 'boolean',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Missing required parameters',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['ERROR'],
                    },
                    error: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Plugin not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['ERROR'],
                    },
                    error: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      PluginManifest: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Plugin name',
            example: 'Math Utils',
          },
          version: {
            type: 'string',
            description: 'Plugin version',
            example: '1.0.0',
          },
          description: {
            type: 'string',
            description: 'Plugin description',
            example: 'Mathematical utility functions for Tensorify',
          },
          slug: {
            type: 'string',
            description: 'Unique plugin identifier',
            example: '@tensorify/math-utils:1.0.0',
          },
          author: {
            type: 'string',
            description: 'Plugin author',
            example: 'tensorify',
          },
          tensorifyVersion: {
            type: 'string',
            description: 'Compatible Tensorify version',
            example: '1.0.0',
          },
          status: {
            type: 'string',
            description: 'Plugin status',
            enum: ['active', 'deprecated', 'beta'],
          },
          githubUrl: {
            type: 'string',
            description: 'GitHub repository URL',
            example: 'https://github.com/tensorify/math-utils',
          },
          tags: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Plugin tags',
            example: ['math', 'utility', 'functions'],
          },
          isPublic: {
            type: 'boolean',
            description: 'Whether plugin is publicly accessible',
          },
          files: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/PluginFile',
            },
            description: 'Plugin files',
          },
          dependencies: {
            type: 'object',
            additionalProperties: {
              type: 'string',
            },
            description: 'Plugin dependencies',
            example: {
              'lodash': '^4.17.21',
            },
          },
          devDependencies: {
            type: 'object',
            additionalProperties: {
              type: 'string',
            },
            description: 'Development dependencies',
          },
          main: {
            type: 'string',
            description: 'Main entry point file',
            example: 'index.js',
          },
          types: {
            type: 'string',
            description: 'TypeScript definitions file',
            example: 'index.d.ts',
          },
          nodes: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/PluginNode',
            },
            description: 'Node definitions provided by plugin',
          },
          category: {
            type: 'string',
            description: 'Plugin category',
            example: 'utility',
          },
          engines: {
            type: 'object',
            additionalProperties: {
              type: 'string',
            },
            description: 'Engine compatibility',
            example: {
              'tensorify': '^1.0.0',
            },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
        required: ['name', 'version', 'description', 'slug', 'author'],
      },
      PluginFile: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'File path relative to plugin root',
            example: 'src/index.js',
          },
          size: {
            type: 'integer',
            description: 'File size in bytes',
            example: 1024,
          },
          lastModified: {
            type: 'string',
            format: 'date-time',
            description: 'Last modification time',
          },
        },
        required: ['path', 'size'],
      },
      PluginNode: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Node identifier',
            example: 'math-add',
          },
          name: {
            type: 'string',
            description: 'Human-readable node name',
            example: 'Add Numbers',
          },
          category: {
            type: 'string',
            description: 'Node category',
            example: 'math',
          },
          description: {
            type: 'string',
            description: 'Node description',
            example: 'Adds two or more numbers together',
          },
        },
        required: ['id', 'name', 'category'],
      },
      InstallRequest: {
        type: 'object',
        properties: {
          pluginSlug: {
            type: 'string',
            description: 'Plugin to install',
            example: '@tensorify/math-utils:1.0.0',
          },
          targetVersion: {
            type: 'string',
            description: 'Specific version to install (optional)',
            example: '1.0.0',
          },
          installationId: {
            type: 'string',
            description: 'Unique installation identifier',
            example: 'install_1234567890_abc123',
          },
          environment: {
            type: 'object',
            properties: {
              tensorifyVersion: {
                type: 'string',
                description: 'Current Tensorify version',
                example: '1.0.0',
              },
              platform: {
                type: 'string',
                description: 'Operating system platform',
                example: 'linux',
              },
              nodeVersion: {
                type: 'string',
                description: 'Node.js version',
                example: 'v18.17.0',
              },
            },
          },
        },
        required: ['pluginSlug', 'installationId'],
      },
      InstallResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Installation success status',
          },
          plugin: {
            type: 'object',
            properties: {
              slug: {
                type: 'string',
              },
              name: {
                type: 'string',
              },
              version: {
                type: 'string',
              },
              description: {
                type: 'string',
              },
              author: {
                type: 'string',
              },
              tensorifyVersion: {
                type: 'string',
              },
              downloadUrl: {
                type: 'string',
                description: 'URL to download plugin bundle',
              },
              manifestUrl: {
                type: 'string',
                description: 'URL to get plugin manifest',
              },
            },
          },
          installation: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Installation ID',
              },
              status: {
                type: 'string',
                enum: ['ready'],
                description: 'Installation status',
              },
              installedAt: {
                type: 'string',
                format: 'date-time',
                description: 'Installation timestamp',
              },
            },
          },
          next_steps: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Next steps for completing installation',
          },
        },
        required: ['success'],
      },
      PluginSearchResult: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
          slug: {
            type: 'string',
          },
          authorName: {
            type: 'string',
          },
          tags: {
            type: 'string',
            description: 'Comma-separated tags',
          },
        },
      },
      PluginDetailedResult: {
        allOf: [
          {
            $ref: '#/components/schemas/PluginSearchResult',
          },
          {
            type: 'object',
            properties: {
              tensorifyVersion: {
                type: 'string',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
              },
              githubUrl: {
                type: 'string',
              },
              isPublic: {
                type: 'boolean',
              },
              status: {
                type: 'string',
              },
              processingStatus: {
                type: 'string',
              },
              processingTitle: {
                type: 'string',
              },
              processingMessage: {
                type: 'string',
              },
            },
          },
        ],
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message',
          },
        },
        required: ['error'],
      },
      VersionIncompatibleResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            enum: ['Version incompatible'],
          },
          details: {
            type: 'object',
            properties: {
              required: {
                type: 'string',
                description: 'Required Tensorify version',
              },
              current: {
                type: 'string',
                description: 'Current user Tensorify version',
              },
              message: {
                type: 'string',
                description: 'Detailed compatibility message',
              },
            },
          },
        },
        required: ['error', 'details'],
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Clerk JWT token for authentication',
      },
    },
  },
};

export default openApiSpec; 