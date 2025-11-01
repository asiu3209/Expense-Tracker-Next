import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Drizzle Kit configuration
// This tells Drizzle where your schema is and how to connect to the database
export default {
  // Schema location - where you define your tables
  schema: "./lib/db/schema.ts",

  // Output directory for migration files
  // Migrations are SQL files that create/modify database tables
  out: "./lib/db/migrations",

  // Database driver (PostgreSQL)
  //Instead of driver, new update replaces it with dialect
  dialect: "postgresql",

  // Connection string from environment variables
  //connection string replaced with url
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },

  // Print SQL statements during migrations (helpful for learning)
  verbose: true,

  // Ask for confirmation before running destructive migrations
  strict: true,
} satisfies Config;
