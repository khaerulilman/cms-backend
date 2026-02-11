module.exports = {
  apps: [
    // 🔴 PRODUCTION
    {
      name: "portfolio-cms",
      script: "src/server.js",
      exec_mode: "fork",
      instances: 1,
      env_production: {
        NODE_ENV: "production",
        PORT: 4000,
      },
    },

    // 🟡 STAGING
    {
      name: "portfolio-cms-staging",
      script: "src/server.js",
      exec_mode: "fork",
      instances: 1,
      env_production: {
        NODE_ENV: "production",
        PORT: 4001,
      },
    },
  ],
};
