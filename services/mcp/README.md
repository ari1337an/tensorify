# Tensorify S3 Plugin Management MCP Server

A **Model Context Protocol (MCP)** server that provides seamless S3-compatible plugin management tools for the Tensorify ecosystem. This server enables developers to manage, upload, and deploy plugins directly from Claude in Cursor IDE.

## 🚀 Features

- **Complete Plugin Lifecycle Management**: Upload, check, list, and delete plugin code and manifests
- **S3-Compatible Storage**: Works with AWS S3, MinIO, and other S3-compatible storage services
- **Type-Safe Operations**: Full TypeScript support with comprehensive validation using Zod
- **Error Handling & Retry Logic**: Robust error handling with exponential backoff retry mechanism
- **Comprehensive Logging**: Configurable debug logging for development and troubleshooting
- **Plugin Slug Validation**: Enforces consistent plugin naming conventions (`@namespace/plugin-name:version`)
- **Health Monitoring**: Built-in S3 connectivity health checks
- **Developer-Friendly**: Designed for seamless integration with Cursor IDE and Claude

## 📋 Available Tools

### 1. `check_if_plugin_exists`

Check if a plugin exists in S3 storage by its slug.

**Parameters:**

- `slug` (string, required): Plugin slug in format `@namespace/plugin-name:version`

**Example:**

```json
{
  "slug": "@tensorify/linear-layer:1.0.0"
}
```

### 2. `list_files_for_plugins`

List plugin files in S3 storage with optional filtering.

**Parameters:**

- `namespace` (string, optional): Filter by namespace
- `pluginName` (string, optional): Filter by plugin name
- `version` (string, optional): Filter by version
- `limit` (number, optional): Maximum number of plugins to return (default: 100, max: 1000)

**Example:**

```json
{
  "namespace": "tensorify",
  "limit": 50
}
```

### 3. `upload_plugin_code`

Upload plugin code to S3 storage.

**Parameters:**

- `slug` (string, required): Plugin slug in format `@namespace/plugin-name:version`
- `code` (string, required): Plugin code content
- `contentType` (string, optional): Content type (default: "application/javascript")

**Example:**

```json
{
  "slug": "@tensorify/linear-layer:1.0.0",
  "code": "function linearLayer(options) { /* implementation */ }",
  "contentType": "application/javascript"
}
```

### 4. `upload_plugin_manifest`

Upload plugin manifest to S3 storage.

**Parameters:**

- `slug` (string, required): Plugin slug in format `@namespace/plugin-name:version`
- `manifest` (string, required): Plugin manifest as JSON string

**Example:**

```json
{
  "slug": "@tensorify/linear-layer:1.0.0",
  "manifest": "{\"name\":\"Linear Layer\",\"version\":\"1.0.0\",\"description\":\"PyTorch linear layer implementation\"}"
}
```

### 5. `delete_plugin_code`

Delete plugin code from S3 storage.

**Parameters:**

- `slug` (string, required): Plugin slug in format `@namespace/plugin-name:version`

### 6. `delete_plugin_manifest`

Delete plugin manifest from S3 storage.

**Parameters:**

- `slug` (string, required): Plugin slug in format `@namespace/plugin-name:version`

## 🛠️ Installation & Setup

### Prerequisites

- Node.js >= 18.0.0
- S3-compatible storage service (AWS S3, MinIO, etc.)

### 1. Install Dependencies

```bash
cd services/mcp
npm install
```

### 2. Environment Configuration

Copy the environment template and configure your S3 credentials:

```bash
cp env.template .env
```

Edit `.env` with your S3 configuration:

```env
# Required S3 Configuration
S3_ACCESS_KEY_ID=your_access_key_here
S3_SECRET_ACCESS_KEY=your_secret_key_here
S3_ENDPOINT=https://s3.amazonaws.com
S3_REGION=us-east-1
S3_BUCKET_NAME=tensorify-plugins

# Optional Configuration
S3_FORCE_PATH_STYLE=false
DEBUG_LOGGING=true
PLUGIN_PATH_PREFIX=plugins/
```

### 3. Build the Server

```bash
npm run build
```

### 4. Start the Server

```bash
npm start
```

## 🔧 Development

### Development Mode

Run the server in development mode with auto-compilation:

```bash
npm run dev
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npm run type-check
```

### Clean Build

```bash
npm run clean
npm run build
```

## 📁 S3 Storage Structure

The server organizes plugins in S3 using the following structure:

```
├── @{namespace}/
│   └── {plugin-name}:{version}/
│       ├── index.js          # Plugin implementation
│       └── manifest.json     # Plugin metadata
├── @{other-namespace}/
│   └── {other-plugin}:{version}/
│       ├── index.js
│       └── manifest.json
```

**Example:**

```
S3 Bucket Root/
├── @tensorify/
│   ├── linear-layer:1.0.0/
│   │   ├── index.js
│   │   └── manifest.json
│   ├── linear-layer:1.1.0/
│   │   ├── index.js
│   │   └── manifest.json
│   └── conv2d-layer:2.0.0/
│       ├── index.js
│       └── manifest.json
└── @community/
    └── custom-activation:1.5.0/
        ├── index.js
        └── manifest.json
```

## 🔧 Configuration Options

### Environment Variables

| Variable               | Required | Default | Description                              |
| ---------------------- | -------- | ------- | ---------------------------------------- |
| `S3_ACCESS_KEY_ID`     | ✅       | -       | S3 access key ID                         |
| `S3_SECRET_ACCESS_KEY` | ✅       | -       | S3 secret access key                     |
| `S3_ENDPOINT`          | ✅       | -       | S3 endpoint URL                          |
| `S3_REGION`            | ✅       | -       | S3 region                                |
| `S3_BUCKET_NAME`       | ✅       | -       | S3 bucket name                           |
| `S3_FORCE_PATH_STYLE`  | ❌       | `false` | Force path-style URLs (useful for MinIO) |
| `DEBUG_LOGGING`        | ❌       | `false` | Enable detailed debug logging            |

### Plugin Slug Format

Plugin slugs must follow the format: `@{namespace}/{plugin-name}:{version}`

**Examples:**

- `@tensorify/linear-layer:1.0.0`
- `@community/custom-activation:2.1.3`
- `@company/proprietary-layer:0.5.0-beta`

**Rules:**

- Namespace and plugin name can contain: letters, numbers, hyphens, underscores
- Version must follow semantic versioning (X.Y.Z)
- Case-sensitive matching

## 🔍 Cursor IDE Integration

### MCP Configuration for Cursor

Add the following to your Cursor MCP configuration:

```json
{
  "mcpServers": {
    "tensorify-s3-plugin": {
      "command": "node",
      "args": ["/path/to/backend.tensorify.io/services/mcp/dist/index.js"],
      "env": {
        "S3_ACCESS_KEY_ID": "your_access_key",
        "S3_SECRET_ACCESS_KEY": "your_secret_key",
        "S3_ENDPOINT": "https://s3.amazonaws.com",
        "S3_REGION": "us-east-1",
        "S3_BUCKET_NAME": "tensorify-plugins"
      }
    }
  }
}
```

### Usage in Claude

Once configured, you can use the tools directly in Claude conversations:

```
@mcp Can you check if the plugin @tensorify/linear-layer:1.0.0 exists?

@mcp Please upload this code as @tensorify/conv2d:1.2.0:
[paste your plugin code here]

@mcp List all plugins in the tensorify namespace
```

## 🛡️ Security Considerations

1. **Credential Management**: Store S3 credentials securely and never commit them to version control
2. **Access Control**: Use IAM policies to restrict S3 access to only necessary operations
3. **Validation**: All inputs are validated using Zod schemas before processing
4. **Error Handling**: Sensitive information is not exposed in error messages
5. **Plugin Isolation**: Each plugin version is stored in its own S3 path

### Recommended S3 IAM Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-plugin-bucket",
        "arn:aws:s3:::your-plugin-bucket/*"
      ]
    }
  ]
}
```

## 📊 Monitoring & Logging

### Log Levels

- **ERROR**: Critical errors that prevent operation
- **WARN**: Warning messages for recoverable issues
- **INFO**: General operational information
- **DEBUG**: Detailed debugging information (enabled with `DEBUG_LOGGING=true`)

### Health Checks

The server performs automatic S3 connectivity health checks on startup and provides health check endpoints for monitoring.

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add comprehensive error handling
3. Include proper logging for debugging
4. Update documentation for new features
5. Ensure backward compatibility

## 📝 License

MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

#### 1. "S3_ACCESS_KEY_ID is required"

- Ensure all required environment variables are set
- Check that your `.env` file is in the correct location
- Verify environment variable names match exactly

#### 2. "Invalid plugin slug format"

- Plugin slugs must follow: `@namespace/plugin-name:version`
- Ensure version follows semantic versioning (X.Y.Z)
- Check for typos in namespace or plugin name

#### 3. "S3 health check failed"

- Verify S3 credentials are correct
- Check S3 endpoint URL is accessible
- Ensure bucket exists and you have proper permissions
- For MinIO, try setting `S3_FORCE_PATH_STYLE=true`

#### 4. Connection timeout errors

- Check network connectivity to S3 endpoint
- Verify firewall settings allow outbound HTTPS
- Consider increasing timeout values for slow connections

### Debug Mode

Enable detailed logging for troubleshooting:

```env
DEBUG_LOGGING=true
```

This will provide comprehensive information about:

- S3 API calls and responses
- Request validation and processing
- Error details and stack traces
- Performance metrics

## 📞 Support

For issues and questions:

1. Check the troubleshooting section above
2. Review the logs with debug mode enabled
3. Open an issue in the repository with:
   - Environment details
   - Error messages
   - Steps to reproduce
   - Log output (with sensitive information removed)
