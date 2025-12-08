// Load environment variables for scripts
// (Next.js automatically loads .env.local, but scripts don't)
import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Check for DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set in environment variables. " +
      "Make sure .env.local exists with DATABASE_URL=postgresql://postgres:postgres@localhost:5432/expensetracker"
  );
}

// Create PostgreSQL connection
const queryClient = postgres(process.env.DATABASE_URL);

// Create Drizzle database instance
export const db = drizzle(queryClient, { schema });
