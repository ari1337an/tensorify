# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-06-27

### 🚀 **MAJOR RELEASE: Package Migration**

**BREAKING CHANGE**: This package has been migrated from `@tensorify/types` to `@tensorify/sdk`

#### Package Migration
- **New Package Name**: `@tensorify/sdk` (previously `@tensorify/types`)
- **Migration**: Please update your imports from `@tensorify/types` to `@tensorify/sdk`
- **Deprecation**: The old `@tensorify/types` package is now deprecated

#### New Features
- ✅ **Complete SDK**: Full plugin development toolkit (not just types)
- ✅ **CLI Tool**: `tensorify-cli` for scaffolding plugins
- ✅ **Templates**: Ready-to-use plugin templates
- ✅ **Examples**: Working PyTorch plugin examples (PTDataset, PTDataLoader, PTConv2d)
- ✅ **Code Generation**: Built-in code generation utilities
- ✅ **Plugin Creation**: `createPlugin()` helper function
- ✅ **Development Utils**: Comprehensive `DevUtils` for common tasks

#### API Changes
- **Enhanced**: All original type definitions preserved and enhanced
- **New**: `BaseNode` class for plugin development
- **New**: `DevUtils` with helper functions
- **New**: `createPlugin()` function
- **New**: CLI commands for plugin scaffolding

#### Migration Guide
```bash
# Old import
npm uninstall @tensorify/types

# New import  
npm install @tensorify/sdk

# Update your code
- const { NodeType } = require('@tensorify/types');
+ const { NodeType } = require('@tensorify/sdk');
```

## [1.0.1] - Previous Release (as @tensorify/types)
- Basic TypeScript type definitions for Tensorify plugins

## [1.0.0] - Initial Release (as @tensorify/types)
- Core type definitions for plugin development

### Added
- Initial release of @tensorify/types
- Complete TypeScript definitions for NodeDefinition interface
- INode base interface with full typing support
- Layer and Model interfaces for data structures
- PropertySchema and EnhancedNodeSchema for validation
- CodeFragment and GenerationContext for code generation
- PluginHelpers utility class with common functions
- CommonSchemas with pre-built schema patterns
- Type guards for runtime validation
- Comprehensive documentation and examples
- Support for all major package managers (npm, yarn, pnpm)

### Security
- Sandbox configuration interfaces
- Security constraints for plugin execution
- Memory and execution time limits

### Documentation
- Complete API reference
- Usage examples for all major interfaces
- Plugin development guide integration
