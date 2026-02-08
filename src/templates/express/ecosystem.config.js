/**
 * PM2 Ecosystem Configuration for Express Backend
 * 
 * Usage:
 *   Development: pm2 start ecosystem.config.js
 *   Production:  pm2 start ecosystem.config.js --env production
 *   Save:        pm2 save
 *   Startup:     pm2 startup
 */

module.exports = {
  apps: [
    {
      name: 'api',
      script: './server.js',
      instances: 1,
      exec_mode: 'cluster',
      
      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      
      // Logging
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Process management
      autorestart: true,
      max_memory_restart: '500M',
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git'],
      
      // Advanced features
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      kill_timeout: 5000,
      
      // Cluster mode options
      instance_var: 'INSTANCE_ID',
      
      // Source map support
      source_map_support: true,
    },
  ],
};
