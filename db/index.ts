import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const isValidConnectionString = Boolean(
  connectionString &&
    (connectionString.startsWith("postgres://") || connectionString.startsWith("postgresql://"))
);

function isLocalDatabaseHost(connStr: string): boolean {
  try {
    const url = new URL(connStr);
    const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1"
    );
  } catch {
    return false;
  }
}

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Returns a typed Drizzle ORM instance connected to the canonical Supabase PostgreSQL database.
 * Returns null gracefully if connection string is missing, invalid, or cannot be parsed.
 */
export function getDb() {
  if (dbInstance) return dbInstance;
  if (!isValidConnectionString || !connectionString) {
    return null;
  }
  try {
    const isLocal = isLocalDatabaseHost(connectionString);
    const client = postgres(connectionString, {
      max: 10,
      prepare: false,
      ssl: isLocal ? false : "require",
    });
    dbInstance = drizzle(client, { schema });
    return dbInstance;
  } catch {
    return null;
  }
}
