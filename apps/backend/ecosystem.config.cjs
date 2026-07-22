// ecosystem.config.cjs — PM2 Cluster Mode Configuration
// Runs one worker per CPU core, acting as a load balancer on a single machine.
// Start with: pm2 start ecosystem.config.cjs --env production

module.exports = {
  apps: [
    {
      name: "travelagency-backend",
      script: "./server.js",

      // 'max' = one instance per CPU core (horizontal scaling on single machine)
      instances: "max",
      exec_mode: "cluster",

      // Auto-restart if memory exceeds 512MB
      max_memory_restart: "512M",

      // Restart delay in ms to avoid tight restart loops
      restart_delay: 3000,

      watch: false,
      ignore_watch: ["node_modules", "logs", ".git"],

      // Logging
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,

      env: {
        NODE_ENV: "development",
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
  ],
};
