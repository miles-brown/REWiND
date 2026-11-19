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
      .select("id, canonical_name, slug, classification, primary_role")
      .ilike("canonical_name", "%Delegation%")
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
    console.log("Nothing to delete.");
    return;
  }

  console.log("Verified placeholders identified for purge:");
  people.slice(0, 10).forEach((p) => console.log(`  - [${p.id}] ${p.canonical_name} (${p.slug})`));
  if (people.length > 10) {
    console.log(`  ... and ${people.length - 10} more.`);
  }

  const personIds = people.map((p) => p.id);

  // 0a. Clear claims attribution references
  console.log("Clearing claims attribution references...");
  for (let i = 0; i < personIds.length; i += 50) {
    const chunk = personIds.slice(i, i + 50);
    const { error } = await supabase
      .from("claims")
      .update({ attribution_speaker_id: null })
      .in("attribution_speaker_id", chunk);
    if (error) {
      console.warn("Claims attribution update chunk warning:", error.message);
    }
  }

  // 0b. Delete quotes where speaker_id references placeholder
  console.log("Clearing quotes referencing placeholder speakers...");
  for (let i = 0; i < personIds.length; i += 50) {
    const chunk = personIds.slice(i, i + 50);
    const { error } = await supabase
      .from("quotes")
      .delete()
      .in("speaker_id", chunk);
    if (error) {
      console.warn("Quotes delete chunk warning:", error.message);
    }
  }

  // 1. Delete dependent claims in chunks of 50
  console.log("Deleting dependent claims...");
  let totalDeletedClaims = 0;
  for (let i = 0; i < personIds.length; i += 50) {
    const chunk = personIds.slice(i, i + 50);
    const { data, error } = await supabase
      .from("claims")
      .delete()
      .in("subject_id", chunk)
      .select("id");
    if (error) {
      console.warn("Claims delete chunk warning:", error.message);
    } else {
      totalDeletedClaims += (data || []).length;
    }
  }
  console.log(`Deleted ${totalDeletedClaims} claims.`);

  // 2. Delete dependent event_people in chunks of 50
  console.log("Deleting dependent event_people links...");
  let totalDeletedEventPeople = 0;
  for (let i = 0; i < personIds.length; i += 50) {
    const chunk = personIds.slice(i, i + 50);
    const { data, error } = await supabase
      .from("event_people")
      .delete()
      .in("person_id", chunk)
      .select("id");
    if (error) {
      console.warn("event_people delete chunk warning:", error.message);
    } else {
      totalDeletedEventPeople += (data || []).length;
    }
  }
  console.log(`Deleted ${totalDeletedEventPeople} event_people.`);

  // 3. Delete placeholder people in chunks of 50
  console.log("Deleting placeholder people records...");
  let totalDeletedPeople = 0;
  for (let i = 0; i < personIds.length; i += 50) {
    const chunk = personIds.slice(i, i + 50);
    const { data, error } = await supabase
      .from("people")
      .delete()
      .in("id", chunk)
      .select("id");
    if (error) {
      console.error("people delete chunk error:", error);
      process.exit(1);
    } else {
      totalDeletedPeople += (data || []).length;
    }
  }
  console.log(`Deleted ${totalDeletedPeople} placeholder people.`);

  // Verification
  const { count, error: vErr } = await supabase
    .from("people")
    .select("*", { count: "exact", head: true })
    .in("id", personIds);

  if (vErr) {
    console.error("Verification query failed:", vErr.message);
    process.exit(1);
  }

  if (count === null || count === undefined || count > 0) {
    console.error(`Verification rejected: ${count ?? "unknown"} placeholder records still remain in database.`);
    process.exit(1);
  }

  console.log("Verification passed: 0 placeholder people remaining in database.");
}

run().catch((err) => {
  console.error("Purge error:", err);
  process.exit(1);
});
