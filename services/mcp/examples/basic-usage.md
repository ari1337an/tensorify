# Basic Usage Examples

This document provides examples of how to use the S3 Plugin Management MCP Server with Claude in Cursor IDE.

## Prerequisites

1. Configure your MCP server in Cursor settings
2. Set up your S3 credentials in environment variables
3. Make sure the MCP server is running

## Example 1: Checking if a Plugin Exists

```
@mcp Can you check if the plugin @tensorify/linear-layer:1.0.0 exists in our S3 storage?
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "exists": false,
    "files": {
      "code": false,
      "manifest": false
    }
  },
  "message": "Plugin not found"
}
```

## Example 2: Uploading a New Plugin

### Step 1: Upload Plugin Code

````
@mcp Please upload this plugin code as @tensorify/linear-layer:1.0.0:

```javascript
import { ModelLayerNode, ModelLayerSettings } from '@tensorify.io/sdk';

interface LinearSettings extends ModelLayerSettings {
  inFeatures: number;
  outFeatures: number;
  bias?: boolean;
}

export default class LinearLayer extends ModelLayerNode<LinearSettings> {
  public readonly name = 'Linear Layer';
  public readonly translationTemplate = 'torch.nn.Linear({in_features}, {out_features}{optional_params})';

  public getTranslationCode(settings: LinearSettings): string {
    return this.buildLayerConstructor(
      'torch.nn.Linear',
      {
        in_features: settings.inFeatures,
        out_features: settings.outFeatures,
      },
      { bias: true },
      settings
    );
  }
}
````

### Step 2: Upload Plugin Manifest

````
@mcp Please upload this manifest for @tensorify/linear-layer:1.0.0:

```json
{
  "name": "Linear Layer",
  "version": "1.0.0",
  "description": "PyTorch linear layer implementation using Tensorify SDK",
  "author": "Tensorify Team",
  "license": "MIT",
  "main": "index.js",
  "entryPoints": {
    "getTranslationCode": {
      "description": "Generate PyTorch code for linear layer"
    }
  },
  "ok": true
}
````

## Example 3: Listing All Plugins

```
@mcp Can you list all plugins in our S3 storage?
```

**Or filter by namespace:**

```
@mcp List all plugins in the 'tensorify' namespace
```

## Example 4: Deleting a Plugin

```
@mcp Please delete the code for plugin @tensorify/old-plugin:0.1.0
```

**And delete the manifest:**

```
@mcp Please delete the manifest for plugin @tensorify/old-plugin:0.1.0
```

## Example 5: Bulk Operations

### Upload Multiple Plugin Files

```
@mcp I need to upload a new plugin @tensorify/conv2d:1.0.0. Here's the code:

[paste your Conv2D implementation]

And here's the manifest:

{
  "name": "Conv2D Layer",
  "version": "1.0.0",
  "description": "2D Convolution layer implementation"
}
```

### Check Multiple Plugins

```
@mcp Can you check if these plugins exist:
- @tensorify/linear-layer:1.0.0
- @tensorify/conv2d:1.0.0
- @tensorify/relu:1.0.0
```

## Plugin Development Workflow

### 1. Development Phase

```
@mcp Check if @mycompany/experimental-layer:0.1.0-beta exists
```

### 2. Testing Phase

```
@mcp Upload my experimental layer code as @mycompany/experimental-layer:0.1.0-beta:
[development code]
```

### 3. Production Release

```
@mcp Upload the stable version as @mycompany/production-layer:1.0.0:
[production code with proper manifest]
```

### 4. Cleanup

```
@mcp Delete the experimental plugin @mycompany/experimental-layer:0.1.0-beta
```

## Advanced Usage

### Plugin Discovery

```
@mcp Show me all versions of the linear-layer plugin
```

### Namespace Management

```
@mcp List all plugins from namespace 'community'
```

### Version Management

```
@mcp Check if we have version 2.0.0 of any tensorify plugins
```

## Error Handling Examples

### Invalid Plugin Slug

```
@mcp Check if plugin tensorify/invalid-format exists
```

**Response:** Error about invalid slug format

### Missing Environment Variables

If S3 credentials are not configured, you'll get helpful error messages directing you to set up the required environment variables.

### Network Issues

The server includes retry logic for transient network issues, but will eventually report connection problems.

## Best Practices

1. **Use Semantic Versioning**: Always use proper version numbers (1.0.0, not 1.0)
2. **Namespace Organization**: Use meaningful namespaces (@company, @team, @project)
3. **Consistent Naming**: Use kebab-case for plugin names (linear-layer, not LinearLayer)
4. **Complete Manifests**: Always provide comprehensive manifest information
5. **Version Management**: Don't overwrite existing versions, create new ones

## Troubleshooting

### Plugin Not Found

- Check the exact slug format
- Verify the plugin was uploaded correctly
- Check S3 permissions

### Upload Failures

- Verify S3 credentials
- Check network connectivity
- Ensure bucket exists and is accessible

### Invalid JSON

- Validate manifest JSON format
- Use proper escape characters in strings
- Check for trailing commas
