// Prisma 7 Configuration — provides datasource URL for CLI commands
// See: https://pris.ly/d/config-datasource

import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
