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
      try {
        await db.insert(schema.auditLog).values({
          eventId: entry.eventId,
          candidateId: entry.candidateId,
          action: entry.action,
          ruleId: entry.ruleId,
          details: entry.details,
          recordedAt: entry.recordedAt,
        });
      } catch (err) {
        // Audit persistence is best-effort observability; log the failure but
        // never propagate so a transient DB error cannot crash an already-committed
        // review decision or leave callers with a misleading rejected promise.
        console.warn("[Audit] Failed to persist audit record to database:", err);
      }
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
