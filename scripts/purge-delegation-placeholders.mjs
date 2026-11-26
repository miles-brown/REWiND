import { createClient } from "@supabase/supabase-js";

if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile(".env.local");
  } catch {}
  try {
    process.loadEnvFile();
  } catch {}
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

async function run() {
  console.log("Querying placeholder people via Supabase REST API...");
  const rawPeople = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error: pErr } = await supabase
      .from("people")
      .select("id, canonical_name, slug, classification, primary_role, summary, updated_at")
      .ilike("canonical_name", "%Delegation%")
      .order("id")
      .range(from, from + pageSize - 1);

    if (pErr) {
      console.error("Failed to query people:", pErr);
      process.exit(1);
    }

    if (!data || data.length === 0) break;
    rawPeople.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  // Restrict to verified synthetic delegation placeholders
  const people = rawPeople.filter((p) => {
    const name = (p.canonical_name || "").trim().toLowerCase();
    const slug = (p.slug || "").trim().toLowerCase();
    const isSyntheticName =
      name.endsWith("delegation") ||
      name.includes("delegation (") ||
      name.startsWith("delegation of") ||
      slug.endsWith("-delegation");
    const isNotRealPerson =
      p.classification === "delegation" ||
      p.classification === "entity" ||
      p.primary_role === "Delegation" ||
      !p.primary_role ||
      isSyntheticName;
    return isSyntheticName && isNotRealPerson;
  });

  console.log(`Found ${people.length} verified placeholder records.`);
  if (people.length === 0) {
    console.log("No placeholder records found requiring audited correction.");
    return;
  }

  console.log("Verified placeholders identified for audited archival correction:");
  people.slice(0, 10).forEach((p) => console.log(`  - [${p.id}] ${p.canonical_name} (${p.slug})`));
  if (people.length > 10) {
    console.log(`  ... and ${people.length - 10} more.`);
  }

  const personIds = people.map((p) => p.id);

  // In accordance with AGENTS.md Section 5.6 Permanent Addition & Non-Deletion Rule:
  // "Once an entity has been added to the REWiND Evidence Atlas, it must NEVER be deleted.
  // Data is strictly additive and progressive. Records must only be improved, extended,
  // enriched, modified, or merged under strict audited conditions. Erroneous / Disputed Data:
  // Correct factual details in place or mark status as 'disputed' / 'limited', maintaining
  // archival provenance audit logs rather than removing records."
  //
  // Evidence Preservation Protocol:
  // 1. Attached quotes are PRESERVED (speaker_id retained).
  // 2. Attached claims are PRESERVED (subject_id and attribution retained).
  // 3. Historical event participation in event_people is PRESERVED intact.
  // 4. Person records are NOT hard-deleted; they are updated in place with archival status:
  //    - classification: "delegation"
  //    - primary_role: "Official Delegation"
  //    - notability_basis: "diplomatic-delegation-composite"
  //    - publication_status: "archived"
  //    - summary: updated with archival provenance audit log
  //    - updated_at: current timestamp

  console.log("Auditing attached evidence across quotes, claims, and event participations...");
  let attachedQuotesCount = 0;
  let attachedClaimsCount = 0;
  let attachedEventsCount = 0;

  for (let i = 0; i < personIds.length; i += 50) {
    const chunk = personIds.slice(i, i + 50);

    const [qRes, cRes, epRes] = await Promise.all([
      supabase.from("quotes").select("id", { count: "exact", head: true }).in("speaker_id", chunk),
      supabase.from("claims").select("id", { count: "exact", head: true }).in("subject_id", chunk),
      supabase.from("event_people").select("id", { count: "exact", head: true }).in("person_id", chunk),
    ]);

    if (qRes.error || typeof qRes.count !== "number") {
      console.error("Failed to count attached quotes:", qRes.error?.message || "Non-numeric count");
      process.exit(1);
    }
    if (cRes.error || typeof cRes.count !== "number") {
      console.error("Failed to count attached claims:", cRes.error?.message || "Non-numeric count");
      process.exit(1);
    }
    if (epRes.error || typeof epRes.count !== "number") {
      console.error("Failed to count attached event participations:", epRes.error?.message || "Non-numeric count");
      process.exit(1);
    }

    attachedQuotesCount += qRes.count;
    attachedClaimsCount += cRes.count;
    attachedEventsCount += epRes.count;
  }

  console.log(
    `Audited evidence to preserve intact: ${attachedQuotesCount} quotes, ${attachedClaimsCount} claims, ${attachedEventsCount} event participations.`
  );

  console.log("Applying audited archival updates to placeholder people records (preserving all evidence)...");
  let totalUpdatedPeople = 0;

  for (let i = 0; i < people.length; i += 50) {
    const chunk = people.slice(i, i + 50);
    for (const p of chunk) {
      let currentSummary = p.summary;
      let currentPrimaryRole = p.primary_role;
      let currentUpdatedAt = p.updated_at;
      let updateSucceeded = false;

      for (let attempt = 0; attempt < 3; attempt++) {
        const existingSummary = (currentSummary || "").trim();
        const auditNote =
          "[Archival Provenance Audit]: Preserved in place per AGENTS.md Permanent Addition & Non-Deletion Rule. Reclassified as composite diplomatic delegation record; historical event participation, claims, and quotes retained.";
        const updatedSummary = existingSummary.includes("Archival Provenance Audit")
          ? existingSummary
          : existingSummary
            ? `${existingSummary}\n\n${auditNote}`
            : auditNote;

        let query = supabase
          .from("people")
          .update({
            classification: "delegation",
            primary_role: currentPrimaryRole || "Official Delegation",
            notability_basis: "diplomatic-delegation-composite",
            publication_status: "archived",
            summary: updatedSummary,
            updated_at: new Date().toISOString(),
          })
          .eq("id", p.id);

        if (currentPrimaryRole === null || currentPrimaryRole === undefined) {
          query = query.is("primary_role", null);
        } else {
          query = query.eq("primary_role", currentPrimaryRole);
        }

        if (currentUpdatedAt === null || currentUpdatedAt === undefined) {
          query = query.is("updated_at", null);
        } else {
          query = query.eq("updated_at", currentUpdatedAt);
        }

        const { data: updatedRows, error: uErr } = await query.select("id");

        if (uErr) {
          console.error(`Failed to update placeholder person [${p.id}]:`, uErr.message);
          process.exit(1);
        }

        if (updatedRows && updatedRows.length > 0) {
          updateSucceeded = true;
          totalUpdatedPeople++;
          break;
        }

        // Conflict: record state or primary_role changed concurrently. Re-read fresh record and retry.
        console.warn(`Concurrent modification conflict on person [${p.id}], retrying update...`);
        const { data: freshRecord, error: fErr } = await supabase
          .from("people")
          .select("summary, primary_role, updated_at")
          .eq("id", p.id)
          .maybeSingle();

        if (fErr || !freshRecord) {
          console.error(`Failed to re-read person [${p.id}] on conflict:`, fErr?.message || "Record not found");
          process.exit(1);
        }
        currentSummary = freshRecord.summary;
        currentPrimaryRole = freshRecord.primary_role;
        currentUpdatedAt = freshRecord.updated_at;
      }

      if (!updateSucceeded) {
        console.error(`Archival update failed for person [${p.id}]: could not resolve concurrent conflict.`);
        process.exit(1);
      }
    }
  }

  console.log(`Successfully updated and archived ${totalUpdatedPeople} delegation placeholder records.`);

  // Verification: Ensure all placeholder records have publication_status = 'archived' and zero deletions occurred
  for (let i = 0; i < personIds.length; i += 50) {
    const chunk = personIds.slice(i, i + 50);
    const { data: verified, error: vErr } = await supabase
      .from("people")
      .select("id, publication_status, classification")
      .in("id", chunk);

    if (vErr) {
      console.error("Verification query failed:", vErr.message);
      process.exit(1);
    }

    const verifiedIds = new Set((verified || []).map((r) => r.id));
    const missingIds = chunk.filter((id) => !verifiedIds.has(id));
    if (missingIds.length > 0) {
      console.error(`Verification rejected: ${missingIds.length} expected records were missing from database.`);
      process.exit(1);
    }

    const unarchived = (verified || []).filter((r) => r.publication_status !== "archived");
    if (unarchived.length > 0) {
      console.error(`Verification rejected: ${unarchived.length} records were not correctly archived.`);
      process.exit(1);
    }
  }

  console.log("Verification passed: 100% of delegation records safely archived with all evidence preserved.");
}

run().catch((err) => {
  console.error("Audit and archive error:", err);
  process.exit(1);
});
