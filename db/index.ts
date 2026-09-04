import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Returns a typed Drizzle ORM instance connected to the canonical Supabase PostgreSQL database.
 */
export function getDb() {
  if (dbInstance) return dbInstance;
  if (!connectionString) {
    return null;
  }
  const client = postgres(connectionString, { max: 10, prepare: false });
  dbInstance = drizzle(client, { schema });
  return dbInstance;
}
