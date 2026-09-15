import { getRelationalStore, getDb } from "@/lib/db/client";
import * as schema from "@/db/schema";
import { desc } from "drizzle-orm";

export interface AuditRecord {
  id: number;
  eventId: string | null;
  candidateId: string | null;
  action: string;
  ruleId: string | null;
  details: string;
  recordedAt: Date;
}

type TransactionClient = Parameters<Parameters<NonNullable<ReturnType<typeof getDb>>["transaction"]>[0]>[0];

export async function recordAuditEventInTransaction(
  tx: TransactionClient,
  action: string,
  ruleId: string | null,
  details: Record<string, unknown>,
  eventId?: string,
  candidateId?: string
): Promise<void> {
  await tx.insert(schema.auditLog).values({
    eventId: eventId || null,
    candidateId: candidateId || null,
    action,
    ruleId: ruleId || null,
    details: JSON.stringify(details),
    recordedAt: new Date(),
  });
}

export function recordAuditEvent(
  action: string,
  ruleId: string | null,
  details: Record<string, unknown>,
  eventId?: string,
  candidateId?: string
): Promise<AuditRecord> & AuditRecord {
  const store = getRelationalStore();
  const entry: AuditRecord = {
    id: store.auditLog.length + 1,
    eventId: eventId || null,
    candidateId: candidateId || null,
    action,
    ruleId: ruleId || null,
    details: JSON.stringify(details),
    recordedAt: new Date(),
  };

  store.auditLog.unshift(entry);

  const db = getDb();
  const persistPromise = (async () => {
    if (db) {
      await db.insert(schema.auditLog).values({
        eventId: entry.eventId,
        candidateId: entry.candidateId,
        action: entry.action,
        ruleId: entry.ruleId,
        details: entry.details,
        recordedAt: entry.recordedAt,
      });
    }
    return entry;
  })();

  return Object.assign(persistPromise, entry);
}

export async function getAuditTrail(): Promise<AuditRecord[]> {
  const db = getDb();
  const store = getRelationalStore();

  if (db) {
    try {
      const rows = await db
        .select()
        .from(schema.auditLog)
        .orderBy(desc(schema.auditLog.recordedAt))
        .limit(100);
      return rows.map((r) => ({
        id: r.id,
        eventId: r.eventId,
        candidateId: r.candidateId,
        action: r.action,
        ruleId: r.ruleId,
        details: r.details,
        recordedAt: r.recordedAt,
      }));
    } catch (err) {
      console.warn("Failed to query live audit trail, falling back to store:", err);
    }
  }

  return store.auditLog;
}
