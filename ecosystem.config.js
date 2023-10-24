module.exports = {
  apps: [
    {
      name: "nZKid",
      exec_mode: "cluster",
      instances: "max", // Or a number of instances
      script: "node_modules/next/dist/bin/next",
      args: "start",
      env_local: {
        APP_ENV: "local", // APP_ENV=local
        PORT: 3000, // Set the port for the local environment
      },
      env_dev: {
        APP_ENV: "dev", // APP_ENV=dev
        PORT: 8080, // Set the port for the development environment
      },
      env_prod: {
        APP_ENV: "production", // APP_ENV=prod
        PORT: 8000, // Set the port for the production environment
      },
    },
  ],
};
