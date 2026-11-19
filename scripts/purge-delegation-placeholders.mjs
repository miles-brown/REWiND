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
  const { data: people, error: pErr } = await supabase
    .from("people")
    .select("id, canonical_name")
    .ilike("canonical_name", "%Delegation%");

  if (pErr) {
    console.error("Failed to query people:", pErr);
    process.exit(1);
  }

  console.log(`Found ${people.length} placeholder people.`);
  if (people.length === 0) {
    console.log("Nothing to delete.");
    return;
  }

  const personIds = people.map((p) => p.id);

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
  const { count } = await supabase
    .from("people")
    .select("*", { count: "exact", head: true })
    .ilike("canonical_name", "%Delegation%");

  console.log(`Verification: ${count ?? 0} placeholder people remaining in database.`);
}

run().catch((err) => {
  console.error("Purge error:", err);
  process.exit(1);
});
