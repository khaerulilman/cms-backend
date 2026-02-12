module.exports = {
  apps: [
    {
      name: "portfolio-cms",
      script: "src/server.js",
      exec_mode: "fork",
      instances: 1,

      env: {
        NODE_ENV: "development",
        PORT: 4000,
      },

      env_production: {
        NODE_ENV: "production",
        PORT: 4000,
      },

      env_staging: {
        NODE_ENV: "staging",
        PORT: 4001,
      },
    },
  ],
};
