import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL");
}

const url = process.env.DATABASE_URL;

export default defineConfig({
  out: "./src/migrations",
  schema: "./src/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url },
  casing: "snake_case",
});
