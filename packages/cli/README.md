# @tensorify.io/cli

Official CLI for Tensorify.io - Build, test, and deploy machine learning plugins with ease.

[![npm version](https://badge.fury.io/js/@tensorify.io%2Fcli.svg)](https://badge.fury.io/js/@tensorify.io%2Fcli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Installation

### Global Installation (Recommended)

```bash
npm install -g @tensorify.io/cli
```

### Local Installation

```bash
npm install @tensorify.io/cli
npx tensorify --help
```

## 📖 Usage

### Authentication

Before using any CLI commands, you must authenticate with your Tensorify.io account:

```bash
# Production authentication
tensorify login

# Development authentication (for contributors)
tensorify login --dev
```

### Available Commands

#### `tensorify login`

Authenticate with Tensorify.io and securely store your session credentials.

**Usage:**

```bash
tensorify login [options]
```

**Options:**

- `-d, --dev` - Use development environment (localhost:3000)
- `-h, --help` - Display help for command

**Examples:**

```bash
# Login to production (default)
tensorify login

# Login to development environment
tensorify login --dev
```

## 🔐 Authentication Flow

The CLI uses a secure OAuth-like flow with Clerk authentication:

1. **Command Execution**: You run `tensorify login`
2. **Local Server**: CLI starts a temporary local callback server
3. **Browser Redirect**: Opens your browser to Tensorify.io sign-in page
4. **User Authentication**: Complete sign-in with your credentials
5. **Callback Handling**: Browser redirects back to local server with session token
6. **Secure Storage**: Session token is stored in your system's keychain
7. **Ready to Use**: All future CLI commands use the stored session

### Environment-Specific URLs

**Production Mode** (`tensorify login`):

- Auth URL: `https://auth.tensorify.io/sign-in`
- API Base: `https://api.tensorify.io`

**Development Mode** (`tensorify login --dev`):

- Auth URL: `http://localhost:3000/sign-in`
- API Base: `http://localhost:8080`

## 🔧 Configuration

### Environment Variables

- `NODE_ENV` - Set to `development` for automatic dev mode
- `CLERK_SECRET_KEY` - Optional: Clerk secret key for advanced authentication features

### Session Storage

Sessions are stored securely using your operating system's credential manager:

- **macOS**: Keychain Access
- **Windows**: Windows Credential Manager
- **Linux**: libsecret (requires `gnome-keyring` or `kde-wallet`)

## 🛠️ Development

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0

### Building from Source

```bash
git clone https://github.com/tensorify/backend.tensorify.io.git
cd backend.tensorify.io/packages/cli
npm install
npm run build
```

### Local Testing

```bash
# Build and test
npm run build
npm start -- --version

# Development mode with auto-rebuild
npm run dev
```

### Running Tests

```bash
npm test
```

## 🐛 Troubleshooting

### Authentication Issues

**Browser doesn't open automatically:**

- Copy and paste the authentication URL displayed in your terminal
- Ensure your default browser is set correctly

**Session storage fails:**

- **Linux**: Install `gnome-keyring` or `kde-wallet`
- **macOS/Windows**: Usually works out of the box

**Authentication timeout:**

- Ensure you complete the sign-in process within 5 minutes
- Check your internet connection
- Try again with `tensorify login`

### Platform-Specific Issues

**Linux keychain setup:**

```bash
# Ubuntu/Debian
sudo apt-get install gnome-keyring

# Fedora/CentOS
sudo yum install gnome-keyring
```

**Permission issues:**

```bash
# Fix npm global permissions (if needed)
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### Network Issues

**Corporate firewall/proxy:**

- Ensure ports 80, 443, and dynamic ports (for callback) are accessible
- Configure npm proxy settings if needed:

```bash
npm config set proxy http://proxy-server:port
npm config set https-proxy http://proxy-server:port
```

## 🔒 Security

### Session Management

- Session tokens are encrypted and stored in OS-specific secure storage
- Tokens automatically expire based on Clerk's session management
- Use `tensorify logout` to manually clear stored sessions (coming soon)

### Best Practices

- Never share your session tokens
- Regularly re-authenticate in production environments
- Use development mode only for local development
- Report security issues to security@tensorify.io

## 📚 API Reference

### Exit Codes

- `0` - Success
- `1` - General error (authentication failed, network error, etc.)

### Error Handling

The CLI provides clear error messages and suggestions:

```bash
$ tensorify login
❌ Authentication failed: Network timeout
💡 Try: Check your internet connection and try again
```

## 🤝 Contributing

See the [main repository](https://github.com/tensorify/backend.tensorify.io) for contribution guidelines.

### Development Setup

```bash
git clone https://github.com/tensorify/backend.tensorify.io.git
cd backend.tensorify.io
npm install
npm run build:cli
```

## 📋 Changelog

### v0.0.1

- Initial release
- Authentication with Clerk integration
- Secure session storage
- Development and production environment support

## 📞 Support

- 📖 [Documentation](https://docs.tensorify.io)
- 🐛 [Issues](https://github.com/tensorify/backend.tensorify.io/issues)
- 💬 [Discussions](https://github.com/tensorify/backend.tensorify.io/discussions)
- 📧 [Email](mailto:support@tensorify.io)

## 📄 License

MIT © [Tensorify.io](https://tensorify.io)

---

**Made with ❤️ by the Tensorify.io team**
