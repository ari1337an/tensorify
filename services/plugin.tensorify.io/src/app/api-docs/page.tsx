import { Metadata } from 'next';
import SwaggerUI from '@/app/_components/ui/SwaggerUI';
import { openApiSpec } from '@/lib/swagger';
import Link from 'next/link';
import { ArrowLeft, Book, Code2, Download, ExternalLink, Github, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'API Documentation - Tensorify Plugins',
  description: 'Interactive API documentation for the Tensorify Plugins marketplace',
  keywords: ['API', 'documentation', 'Tensorify', 'plugins', 'REST API', 'OpenAPI', 'Swagger'],
};

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-16">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-12">
            <Link
              href="/"
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">Back to Home</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/docs"
                className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
              >
                <Book className="w-4 h-4" />
                <span>Documentation</span>
              </Link>
              <Link
                href="/api/openapi"
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors backdrop-blur-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download OpenAPI Spec</span>
              </Link>
            </div>
          </div>

          {/* Header Content */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 rounded-2xl shadow-2xl">
                <Code2 className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl font-bold text-white mb-6">
              Tensorify Plugins API
            </h1>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Comprehensive REST API for plugin distribution, discovery, and management. 
              Build powerful integrations with interactive documentation and real-time testing.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">6</div>
                <div className="text-white/70 text-sm">API Endpoints</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">3</div>
                <div className="text-white/70 text-sm">Service Categories</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">OpenAPI 3.0</div>
                <div className="text-white/70 text-sm">Standard Compliant</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Plugin Distribution */}
          <div className="group">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 border border-gray-100">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Download className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Plugin Distribution</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Download plugin bundles as ZIP files, access complete metadata, and manage plugin installations with robust APIs.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Bundle Downloads
                </div>
                <div className="flex items-center text-gray-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Manifest Access
                </div>
                <div className="flex items-center text-gray-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Installation APIs
                </div>
              </div>
            </div>
          </div>

          {/* Plugin Discovery */}
          <div className="group">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 border border-gray-100">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Plugin Discovery</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Search and browse available plugins with advanced filtering, sorting, and comprehensive metadata access.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-500">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Smart Search
                </div>
                <div className="flex items-center text-gray-500">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Advanced Filtering
                </div>
                <div className="flex items-center text-gray-500">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Sorting Options
                </div>
              </div>
            </div>
          </div>

          {/* Access Control */}
          <div className="group">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 border border-gray-100">
              <div className="bg-gradient-to-br from-purple-500 to-violet-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Access Control</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Secure authentication with Clerk JWT tokens, permission management, and private plugin access control.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-500">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  JWT Authentication
                </div>
                <div className="flex items-center text-gray-500">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Permission Checks
                </div>
                <div className="flex items-center text-gray-500">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Private Access
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 mb-16 text-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Quick Start Guide</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                  Authentication
                </h3>
                <p className="text-gray-300 mb-4">
                  Most endpoints support both public and authenticated access. For private plugins and advanced features, include your Clerk JWT token.
                </p>
                <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm">
                  <span className="text-gray-400">Authorization:</span> <span className="text-green-400">Bearer your_jwt_token</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="bg-purple-500 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                  Try It Out
                </h3>
                <p className="text-gray-300 mb-4">
                  Use the interactive documentation below to test endpoints directly in your browser. Authentication is handled automatically.
                </p>
                <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm">
                  <span className="text-blue-400">GET</span> <span className="text-gray-300">/api/plugins/search?q=math</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Authentication Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
          <div className="flex items-start">
            <div className="bg-amber-100 rounded-lg p-2 mr-4">
              <Shield className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-900 mb-2">Authentication & Testing</h4>
              <p className="text-amber-800 text-sm leading-relaxed">
                The interactive documentation automatically includes your authentication token when making requests. 
                This means you can test both public and private endpoints seamlessly. For external integrations, 
                you&apos;ll need to manually include the JWT token in your requests.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Documentation */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Interactive API Documentation</h2>
                <p className="text-gray-600">Explore and test all available endpoints with real-time responses</p>
              </div>
              <div className="flex items-center space-x-4">
                <a
                  href="/api/openapi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm">OpenAPI JSON</span>
                </a>
                <a
                  href="https://github.com/tensorify/plugins"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span className="text-sm">Source Code</span>
                </a>
              </div>
            </div>
          </div>
          
          <SwaggerUI spec={openApiSpec} />
        </div>

        {/* Support Section */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Get started quickly with our comprehensive documentation, or reach out to our team for personalized support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/docs"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Book className="w-4 h-4 mr-2" />
              View Documentation
            </Link>
            <a
              href="mailto:support@tensorify.io"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 