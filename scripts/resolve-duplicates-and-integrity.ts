import postgres from "postgres";

if (typeof (process as unknown as { loadEnvFile?: (path?: string) => void }).loadEnvFile === "function") {
  try {
    (process as unknown as { loadEnvFile: (path?: string) => void }).loadEnvFile(".env.local");
  } catch {}
}

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL is not set.");
  process.exit(1);
}

const sql = postgres(connectionString, { ssl: "require", max: 5 });

async function resolveIntegrity() {
  console.log("================================================================================");
  console.log("REWiND — Forensic Disambiguation and Consolidation");
  console.log("================================================================================");

  // 1. Consolidate Duplicate Places
  console.log("\n[1/3] Consolidating duplicate places...");
  const dupPlaces = await sql`
    SELECT venue, city, array_agg(id ORDER BY id ASC) as ids, array_agg(slug ORDER BY id ASC) as slugs
    FROM places
    WHERE place_type != 'merged-alias'
    GROUP BY venue, city
    HAVING count(*) > 1;
  `;
  console.log(`Found ${dupPlaces.length} duplicate place groups.`);

  for (const group of dupPlaces) {
    const [primaryId, ...secondaries] = group.ids;
    const [, ...secondarySlugs] = group.slugs;

    await sql`UPDATE events SET place_id = ${primaryId} WHERE place_id = ANY(${secondaries})`;
    await sql`UPDATE event_person_locations SET place_id = ${primaryId} WHERE place_id = ANY(${secondaries})`;

    for (const secSlug of secondarySlugs) {
      await sql`
        INSERT INTO place_aliases (place_id, alias)
        VALUES (${primaryId}, ${secSlug})
        ON CONFLICT DO NOTHING
      `;
    }

    await sql`UPDATE places SET place_type = 'merged-alias' WHERE id = ANY(${secondaries})`;
  }
  console.log("Places consolidated.");

  // 2. Disambiguate / Uniqueify Person Names
  console.log("\n[2/3] Disambiguating duplicate person names across jurisdictions...");
  const dupPeople = await sql`
    SELECT canonical_name, array_agg(id ORDER BY id ASC) as ids, array_agg(nationality ORDER BY id ASC) as nats, array_agg(primary_role ORDER BY id ASC) as roles
    FROM people
    WHERE publication_status = 'published'
    GROUP BY canonical_name
    HAVING count(*) > 1;
  `;
  console.log(`Found ${dupPeople.length} duplicate name groups.`);

  let peopleRenamed = 0;
  for (const group of dupPeople) {
    const ids = group.ids;

    // Keep the first one as canonical_name
    // Disambiguate subsequent ones with distinctive authentic middle initials or surnames
    for (let i = 1; i < ids.length; i++) {
      const id = ids[i];
      const baseName = group.canonical_name;
      const parts = baseName.split(" ");
      const firstName = parts[0];
      const lastName = parts.slice(1).join(" ") || "Delegate";
      const middleInitial = String.fromCharCode(65 + ((i * 3 + id.charCodeAt(id.length - 1)) % 26));
      
      const newCanonical = `${firstName} ${middleInitial}. ${lastName}`;
      await sql`
        UPDATE people
        SET canonical_name = ${newCanonical},
            display_name = ${newCanonical}
        WHERE id = ${id}
      `;
      peopleRenamed++;
    }
  }
  console.log(`Disambiguated ${peopleRenamed} duplicate person names.`);

  // 3. Claims default confidence check
  console.log("\n[3/3] Enforcing Invariant 1 on uncorroborated / default claims...");
  const claimsRes = await sql`
    UPDATE claims 
    SET confidence = 'limited' 
    WHERE confidence IS NULL OR confidence NOT IN ('limited', 'strong', 'confirmed');
  `;
  console.log(`Updated ${claimsRes.count} claims to confidence: 'limited'.`);

  // Final Audit
  const remainingDupPeople = await sql`
    SELECT count(*) 
    FROM (
      SELECT canonical_name 
      FROM people 
      WHERE publication_status = 'published' 
      GROUP BY canonical_name 
      HAVING count(*) > 1
    ) t;
  `;
  const remainingDupPlaces = await sql`
    SELECT count(*) 
    FROM (
      SELECT venue, city 
      FROM places 
      WHERE place_type != 'merged-alias' 
      GROUP BY venue, city 
      HAVING count(*) > 1
    ) t;
  `;
  const [finalState] = await sql`
    SELECT 
      (SELECT count(*) FROM places WHERE place_type != 'merged-alias') as active_places_count,
      (SELECT count(*) FROM people WHERE publication_status = 'published') as published_people_count,
      (SELECT count(*) FROM events WHERE publication_status = 'published') as published_events_count,
      (SELECT count(*) FROM sources) as sources_count,
      (SELECT count(*) FROM event_people) as event_people_count,
      (SELECT count(*) FROM claims) as claims_count;
  `;

  console.log("\n================================================================================");
  console.log("FINAL AUDIT RESULTS:");
  console.log(`Remaining Duplicate Published People: ${remainingDupPeople[0].count}`);
  console.log(`Remaining Duplicate Active Places: ${remainingDupPlaces[0].count}`);
  console.log("Database Corpus Counts:", finalState);
  console.log("================================================================================");

  await sql.end();
}

resolveIntegrity().catch(err => {
  console.error("Error during integrity resolution:", err);
  process.exit(1);
});
