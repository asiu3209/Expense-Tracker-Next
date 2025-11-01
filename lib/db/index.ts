import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" }); // 👈 loads your .env.local file
// Check if DATABASE_URL is set
// This prevents cryptic errors if environment variable is missing
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create PostgreSQL connection
// This connection is reused across all database queries
const connectionString = process.env.DATABASE_URL;

// postgres() creates the connection pool
// A pool maintains multiple database connections for performance
const queryClient = postgres(connectionString);

// drizzle() wraps the connection with ORM functionality
// schema provides TypeScript types for your tables
export const db = drizzle(queryClient, { schema });

// Export schema for use in queries
export { schema };
