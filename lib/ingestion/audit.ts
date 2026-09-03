import { getRelationalStore } from "@/lib/db/client";

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
): AuditRecord {
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
  return entry;
}

export function getAuditTrail(): AuditRecord[] {
  const store = getRelationalStore();
  return store.auditLog;
}
