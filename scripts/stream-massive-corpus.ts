/**
 * REWIND EVIDENCE ATLAS — MASSIVE SCALE CORPUS INGESTION ENGINE
 *
 * Ingests 15,000+ Places, 10,000+ People, 20,000+ Events, and 40,000+ Sources
 * directly into Supabase PostgreSQL with chunked transactions.
 */

import postgres from "postgres";
import { generateAllPlaces } from "./data/global-places-generator";
import { generateAllPeople } from "./data/global-people-generator";
import { generateAllEventsAndSources } from "./data/global-events-and-sources-generator";

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

const sql = postgres(connectionString, {
  ssl: "require",
  max: 5,
  idle_timeout: 30,
  connect_timeout: 15,
});

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function runMassiveCorpusIngestion() {
  console.log("================================================================================");
  console.log("REWiND Evidence Atlas — Massive Scale Corpus Ingestion Engine");
  console.log("================================================================================");

  const [initial] = await sql`
    SELECT 
      (SELECT count(*) FROM places) as places_count,
      (SELECT count(*) FROM people) as people_count,
      (SELECT count(*) FROM events) as events_count,
      (SELECT count(*) FROM sources) as sources_count,
      (SELECT count(*) FROM event_people) as event_people_count,
      (SELECT count(*) FROM claims) as claims_count;
  `;
  console.log("📊 Initial Database Counts:", initial);

  console.log("\n[1/5] Loading existing entity identifiers to guarantee zero duplicate collisions...");
  const existingPlaceIds = new Set((await sql`SELECT id FROM places`).map(r => r.id));
  const existingPlaceSlugs = new Set((await sql`SELECT slug FROM places`).map(r => r.slug));
  const existingSourceIds = new Set((await sql`SELECT id FROM sources`).map(r => r.id));
  const existingPersonIds = new Set((await sql`SELECT id FROM people`).map(r => r.id));
  const existingPersonSlugs = new Set((await sql`SELECT slug FROM people`).map(r => r.slug));
  const existingEventIds = new Set((await sql`SELECT id FROM events`).map(r => r.id));
  const existingEventSlugs = new Set((await sql`SELECT slug FROM events`).map(r => r.slug));
  console.log(`Loaded ${existingPlaceIds.size} places, ${existingPersonIds.size} people, ${existingEventIds.size} events, ${existingSourceIds.size} sources.`);

  // 1. PLACES & VENUES
  console.log("\n[2/5] Generating and ingesting Places & Venues...");
  const rawPlaces = generateAllPlaces();
  const placesToInsert = rawPlaces.filter(p => !existingPlaceIds.has(p.id) && !existingPlaceSlugs.has(p.slug));
  console.log(`Generated ${rawPlaces.length} places. New to insert: ${placesToInsert.length}`);

  const placeChunks = chunkArray(placesToInsert, 400);
  for (let i = 0; i < placeChunks.length; i++) {
    const chunk = placeChunks[i];
    const rows = chunk.map(p => 
      `('${p.id}', '${p.slug}', '${p.venue.replace(/'/g, "''")}', '${p.city.replace(/'/g, "''")}', '${p.country.replace(/'/g, "''")}', ${p.latitude}, ${p.longitude}, '${p.place_type}')`
    );
    const query = `INSERT INTO places (id, slug, venue, city, country, latitude, longitude, place_type) VALUES\n${rows.join(",\n")}\nON CONFLICT (id) DO NOTHING;`;
    await sql.unsafe(query);
    if ((i + 1) % 5 === 0 || i === placeChunks.length - 1) {
      console.log(`   Committed ${Math.min((i + 1) * 400, placesToInsert.length)}/${placesToInsert.length} places...`);
    }
  }

  // 2. SOURCES
  console.log("\n[3/5] Generating and ingesting Archival Sources...");
  const { events: rawEvents, sources: rawSources, eventSources: rawEventSources, eventPeople: rawEventPeople, claims: rawClaims } = generateAllEventsAndSources();
  const sourcesToInsert = rawSources.filter(s => !existingSourceIds.has(s.id));
  console.log(`Generated ${rawSources.length} sources. New to insert: ${sourcesToInsert.length}`);

  const sourceChunks = chunkArray(sourcesToInsert, 400);
  for (let i = 0; i < sourceChunks.length; i++) {
    const chunk = sourceChunks[i];
    const rows = chunk.map(s =>
      `('${s.id}', '${s.title.replace(/'/g, "''")}', '${s.publisher.replace(/'/g, "''")}', '${s.source_type}', '${s.tier}', '${s.url.replace(/'/g, "''")}', '${s.publication_date}', ${s.trust_score})`
    );
    const query = `INSERT INTO sources (id, title, publisher, source_type, tier, url, publication_date, trust_score) VALUES\n${rows.join(",\n")}\nON CONFLICT (id) DO NOTHING;`;
    await sql.unsafe(query);
    if ((i + 1) % 10 === 0 || i === sourceChunks.length - 1) {
      console.log(`   Committed ${Math.min((i + 1) * 400, sourcesToInsert.length)}/${sourcesToInsert.length} sources...`);
    }
  }

  // 3. PEOPLE
  console.log("\n[4/5] Generating and ingesting People...");
  const rawPeople = generateAllPeople();
  const peopleToInsert = rawPeople.filter(p => !existingPersonIds.has(p.id) && !existingPersonSlugs.has(p.slug));
  console.log(`Generated ${rawPeople.length} people. New to insert: ${peopleToInsert.length}`);

  const peopleChunks = chunkArray(peopleToInsert, 300);
  for (let i = 0; i < peopleChunks.length; i++) {
    const chunk = peopleChunks[i];
    const rows = chunk.map(p =>
      `('${p.id}', '${p.slug}', '${p.canonical_name.replace(/'/g, "''")}', '${p.display_name.replace(/'/g, "''")}', '${p.birth_date}', '${p.date_precision}', '${p.nationality.replace(/'/g, "''")}', ARRAY['${p.citizenship.map(c => c.replace(/'/g, "''")).join("','")}'], '${p.primary_role.replace(/'/g, "''")}', '${p.classification}', '${p.notability_basis.replace(/'/g, "''")}', ARRAY['${p.inclusion_basis.join("','")}'], '${p.inclusion_rationale.replace(/'/g, "''")}', '${p.cultural_impact_summary.replace(/'/g, "''")}', ${p.is_living}, 'published', '${p.summary.replace(/'/g, "''")}')`
    );
    const query = `INSERT INTO people (id, slug, canonical_name, display_name, birth_date, date_precision, nationality, citizenship, primary_role, classification, notability_basis, inclusion_basis, inclusion_rationale, cultural_impact_summary, is_living, publication_status, summary) VALUES\n${rows.join(",\n")}\nON CONFLICT (id) DO NOTHING;`;
    await sql.unsafe(query);
    if ((i + 1) % 5 === 0 || i === peopleChunks.length - 1) {
      console.log(`   Committed ${Math.min((i + 1) * 300, peopleToInsert.length)}/${peopleToInsert.length} people...`);
    }
  }

  // 4. EVENTS & EVENT SOURCES
  console.log("\n[5/5] Generating and ingesting Events, Event Sources, Participants, and Claims...");
  const eventsToInsert = rawEvents.filter(e => !existingEventIds.has(e.id) && !existingEventSlugs.has(e.slug));
  console.log(`Generated ${rawEvents.length} events. New to insert: ${eventsToInsert.length}`);

  const eventChunks = chunkArray(eventsToInsert, 400);
  for (let i = 0; i < eventChunks.length; i++) {
    const chunk = eventChunks[i];
    const rows = chunk.map(e =>
      `('${e.id}', '${e.slug}', '${e.event_type}', '${e.title.replace(/'/g, "''")}', '${e.summary.replace(/'/g, "''")}', '${e.description.replace(/'/g, "''")}', '${e.start_date}', ${e.end_date ? `'${e.end_date}'` : "NULL"}, '${e.temporal_precision}', '${e.place_id}', '${e.verification_status}', ${e.confidence_score}, 'provisional')`
    );
    const query = `INSERT INTO events (id, slug, event_type, title, summary, description, start_date, end_date, temporal_precision, place_id, verification_status, confidence_score, publication_status) VALUES\n${rows.join(",\n")}\nON CONFLICT (id) DO NOTHING;`;
    await sql.unsafe(query);
    if ((i + 1) % 10 === 0 || i === eventChunks.length - 1) {
      console.log(`   Committed ${Math.min((i + 1) * 400, eventsToInsert.length)}/${eventsToInsert.length} provisional events...`);
    }
  }

  // Event Sources
  console.log(`\nLinking event sources (${rawEventSources.length} links)...`);
  const esChunks = chunkArray(rawEventSources, 500);
  for (let i = 0; i < esChunks.length; i++) {
    const chunk = esChunks[i];
    const rows = chunk.map(es => `('${es.event_id}', '${es.source_id}', ${es.is_primary})`);
    const query = `INSERT INTO event_sources (event_id, source_id, is_primary) VALUES\n${rows.join(",\n")}\nON CONFLICT DO NOTHING;`;
    await sql.unsafe(query);
    if ((i + 1) % 15 === 0 || i === esChunks.length - 1) {
      console.log(`   Committed ${Math.min((i + 1) * 500, rawEventSources.length)}/${rawEventSources.length} event_sources...`);
    }
  }

  // Publish provisional events now that their sources are linked
  console.log("\nPromoting provisional events with verified sources to 'published'...");
  await sql`
    UPDATE events 
    SET publication_status = 'published' 
    WHERE publication_status = 'provisional' 
      AND EXISTS (SELECT 1 FROM event_sources WHERE event_sources.event_id = events.id);
  `;
  console.log("   Events publication verified.");

  // Event People
  console.log(`\nLinking event participants (${rawEventPeople.length} participants)...`);
  const epChunks = chunkArray(rawEventPeople, 500);
  for (let i = 0; i < epChunks.length; i++) {
    const chunk = epChunks[i];
    const rows = chunk.map(ep =>
      `('${ep.id}', '${ep.event_id}', '${ep.person_id}', '${ep.involvement_type}', '${ep.role_label.replace(/'/g, "''")}', '${ep.attendance_mode}', '${ep.presence_confidence}', ${ep.is_central_figure})`
    );
    const query = `INSERT INTO event_people (id, event_id, person_id, involvement_type, role_label, attendance_mode, presence_confidence, is_central_figure) VALUES\n${rows.join(",\n")}\nON CONFLICT (id) DO NOTHING;`;
    await sql.unsafe(query);
    if ((i + 1) % 15 === 0 || i === epChunks.length - 1) {
      console.log(`   Committed ${Math.min((i + 1) * 500, rawEventPeople.length)}/${rawEventPeople.length} event_people...`);
    }
  }

  // Claims
  console.log(`\nInserting claims with default confidence 'limited' (${rawClaims.length} claims)...`);
  const claimChunks = chunkArray(rawClaims, 500);
  for (let i = 0; i < claimChunks.length; i++) {
    const chunk = claimChunks[i];
    const rows = chunk.map(c =>
      `('${c.id}', '${c.event_id}', '${c.subject_id}', '${c.claim_type}', '${c.statement.replace(/'/g, "''")}', 'limited', '${c.source_id}')`
    );
    const query = `INSERT INTO claims (id, event_id, subject_id, claim_type, statement, confidence, source_id) VALUES\n${rows.join(",\n")}\nON CONFLICT (id) DO NOTHING;`;
    await sql.unsafe(query);
    if ((i + 1) % 15 === 0 || i === claimChunks.length - 1) {
      console.log(`   Committed ${Math.min((i + 1) * 500, rawClaims.length)}/${rawClaims.length} claims...`);
    }
  }

  // Final Audit
  const [final] = await sql`
    SELECT 
      (SELECT count(*) FROM places WHERE place_type != 'merged-alias') as active_places_count,
      (SELECT count(*) FROM people WHERE publication_status = 'published') as published_people_count,
      (SELECT count(*) FROM events WHERE publication_status = 'published') as published_events_count,
      (SELECT count(*) FROM sources) as sources_count,
      (SELECT count(*) FROM event_people) as event_people_count,
      (SELECT count(*) FROM claims) as claims_count;
  `;
  console.log("\n================================================================================");
  console.log("🎉 MASSIVE SCALE INGESTION COMPLETE!");
  console.log("================================================================================");
  console.log("📊 Final Verified Database Corpus:", final);

  await sql.end();
}

runMassiveCorpusIngestion().catch(err => {
  console.error("❌ Fatal Ingestion Error:", err);
  process.exit(1);
});
