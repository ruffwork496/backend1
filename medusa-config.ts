import { loadEnv, defineConfig } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    workerMode: process.env.MEDUSA_WORKER_MODE as "shared" | "worker" | "server", // e.g. "server" or "worker" in production [[Worker mode](https://docs.medusajs.com/learn/configurations/medusa-config#workermode)]

    http: {
      // CORS should be fully controlled via env in production [[Medusa config](https://docs.medusajs.com/learn/configurations/medusa-config#configuration-file)]
      storeCors: process.env.STORE_CORS!,   // e.g. https://your-storefront.com
      adminCors: process.env.ADMIN_CORS!,   // e.g. https://your-medusa-backend.com
      authCors: process.env.AUTH_CORS!,     // e.g. https://your-storefront.com,https://your-medusa-backend.com

      // Must be set in production; app crashes if missing [[http.jwtSecret](https://docs.medusajs.com/learn/configurations/medusa-config#http)]
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },

  admin: {
    // Disable admin on worker instance, keep enabled on server instance [[Admin config](https://docs.medusajs.com/learn/configurations/medusa-config#admin-configurations-admin); [General deploy](https://docs.medusajs.com/learn/deployment/general#1-configure-medusa-application)]
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
    // Backend URL for the Admin SPA when served from a different domain [[Admin backendUrl](https://docs.medusajs.com/learn/configurations/medusa-config#admin-configurations-admin)]
    backendUrl: process.env.MEDUSA_BACKEND_URL,
  },

  modules: [
    // Recommended production modules [[Production modules](https://docs.medusajs.com/learn/deployment/general#3-install-production-modules-and-providers)]
    {
      resolve: "@medusajs/medusa/caching",
      options: {
        providers: [
          {
            resolve: "@medusajs/caching-redis",
            id: "caching-redis",
            is_default: true,
            options: {
              redisUrl: process.env.CACHE_REDIS_URL,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: {
        redis: {
          url: process.env.REDIS_URL,
        },
      },
    },
    {
      resolve: "@medusajs/medusa/locking",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/locking-redis",
            id: "locking-redis",
            is_default: true,
            options: {
              redisUrl: process.env.LOCKING_REDIS_URL,
            },
          },
        ],
      },
    },
  ],
})
