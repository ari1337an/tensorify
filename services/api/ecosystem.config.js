module.exports = {
  apps: [
    {
      name: "tensorify-api",
      script: "dist/index.js",
      cwd: "./",
      instances: 1, // Set to 'max' for cluster mode based on CPU cores
      exec_mode: "fork", // Use 'cluster' for load balancing

      // Restart configuration
      watch: false, // Set to true in development if you want file watching
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      max_memory_restart: "1G",

      // Error handling and crash recovery
      restart_delay: 4000,
      exp_backoff_restart_delay: 100,

      // Environment variables
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 3001,
        watch: true,
      },
      env_staging: {
        NODE_ENV: "staging",
        PORT: 3001,
      },

      // Logging configuration
      log_file: "./logs/combined.log",
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,

      // Process management
      kill_timeout: 5000,
      listen_timeout: 3000,

      // Health monitoring
      health_check_grace_period: 3000,

      // Advanced options for stability (CRITICAL: --no-node-snapshot required for isolated-vm)
      node_args: "--no-node-snapshot --max-old-space-size=1024",

      // Ignore specific watch patterns (if watch is enabled)
      ignore_watch: ["node_modules", "logs", "*.log", ".git"],

      // Source map support for better error reporting
      source_map_support: true,

      // Graceful shutdown
      shutdown_with_message: true,
    },
  ],

  // Deployment configuration (optional)
  deploy: {
    production: {
      user: "deployment",
      host: "backend.tensorify.io",
      ref: "origin/main",
      repo: "git@github.com:AlphaWolf-Ventures/backend.tensorify.io.git",
      path: "/var/www/tensorify-api",
      "pre-deploy-local": "",
      "post-deploy":
        "npm install && npm run build && pm2 reload ecosystem.config.js --env production",
      "pre-setup": "",
    },
  },
};
