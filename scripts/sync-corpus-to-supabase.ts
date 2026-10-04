/**
 * REWIND EVIDENCE ATLAS — CANONICAL DATABASE SYNCHRONIZATION SCRIPT
 *
 * Forensically synchronizes the entire canonical seed corpus into live Supabase PostgreSQL:
 * 1. Coverage Programmes
 * 2. 211+ Canonical People Records (with demographics, inclusion criteria, aliases, and relations)
 * 3. Primary Sources Catalog
 * 4. Places & Venues Gazetteer
 * 5. Historical Events Corpus (including 3D flight/transit corridors & Great Circle coordinates)
 * 6. Event Participants & Co-attendance Rosters (event_people)
 * 7. Primary Source Mappings (event_sources)
 * 8. Archival Quotes
 * 9. Atomic Evidence Claims
 * 10. Topics & Topical Cross-References
 */

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, sql } from "drizzle-orm";
import * as schema from "../db/schema";
import { getPostgresSslConfig } from "../lib/db/client";
import {
  masterPeopleSeed,
  officialRolesSeed,
  milestonesSeed,
  topicsSeed,
  royalEducationSeed,
  royalCareerSeed,
  royalAwardsSeed,
  royalWorksSeed,
  royalStaysSeed,
} from "../data/seeds/index";
import { eventsCorpus } from "../data/seeds/events-corpus";
import { sourcesCorpus } from "../data/seeds/sources-corpus";
import { events as legacyEvents, sources as legacySources } from "../archive/legacy-data/rewind";

if (typeof (process as unknown as { loadEnvFile?: (path?: string) => void }).loadEnvFile === "function") {
  try {
    (process as unknown as { loadEnvFile: (path?: string) => void }).loadEnvFile(".env.local");
  } catch {}
  try {
    (process as unknown as { loadEnvFile: (path?: string) => void }).loadEnvFile();
  } catch {}
}

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error("❌ ERROR: DATABASE_URL or POSTGRES_URL is not set in environment or .env.local.");
  process.exit(1);
}

const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1") || connectionString.includes("::1");

console.log("================================================================================");
console.log("REWiND Evidence Atlas — Live Supabase Corpus Synchronization");
console.log("================================================================================");

const client = postgres(connectionString, {
  max: 10,
  ssl: getPostgresSslConfig(isLocal),
});

const db = drizzle(client, { schema });

// Participant alias mappings to ensure zero foreign key mismatches
const PARTICIPANT_ID_ALIASES: Record<string, string> = {
  "king-hussein-jordan": "king-hussein",
  "king-abdullah-saudi": "abdullah-saudi",
  "nabil-el-araby": "nabil-elaraby",
  "prince-hans-adam-ii": "hans-adam-ii-liechtenstein",
  "king-felipe-vi": "felipe-vi-spain",
  "queen-letizia": "queen-letizia-spain",
  "princess-leonor": "leonor-princess-of-asturias",
  "infanta-sofia": "infanta-sofia-spain",
  "king-philippe-belgium": "philippe-belgium",
  "princess-elisabeth-belgium": "princess-elisabeth-belgium",
  "king-willem-alexander": "willem-alexander-netherlands",
  "queen-maxima": "queen-maxima-netherlands",
  "princess-catharina-amalia": "catharina-amalia-netherlands",
  "king-carl-xvi-gustaf": "carl-xvi-gustaf-sweden",
  "queen-silvia-sweden": "queen-silvia-sweden",
  "crown-princess-victoria": "victoria-crown-princess-sweden",
  "king-harald-v": "harald-v-norway",
  "queen-sonja-norway": "queen-sonja-norway",
  "crown-prince-haakon": "haakon-crown-prince-norway",
  "king-frederik-x": "frederik-x-denmark",
  "queen-mary-denmark": "queen-mary-denmark",
  "queen-margrethe-ii": "margrethe-ii-denmark",
  "prince-albert-ii": "albert-ii-monaco",
  "princess-charlene": "princess-charlene-monaco",
  "grand-duke-henri": "henri-luxembourg",
  "grand-duchess-maria-teresa": "maria-teresa-luxembourg",
  "hereditary-grand-duke-guillaume": "guillaume-hereditary-grand-duke-luxembourg",
  "hereditary-prince-alois": "alois-hereditary-prince-liechtenstein",
  "prince-edward": "prince-edward-duke-of-edinburgh",
  "prince-george": "prince-george-of-wales",
  "princess-charlotte": "princess-charlotte-of-wales",
  "prince-louis": "prince-louis-of-wales",
};

/**
 * Synchronizes bundled people, sources, places, events, and related records to PostgreSQL.
 * Publishes synchronized people and events, writes each event and its evidence in
 * one transaction, and reports row counts. Database failures reject the promise.
 */
async function syncCorpus() {
  console.log("🔌 Connected to live PostgreSQL database.");

  // ---------------------------------------------------------
  // 1. Coverage Programmes
  // ---------------------------------------------------------
  console.log("\n📦 1. Synchronizing Coverage Programmes...");
  const programmes = [
    {
      id: "prog-heads-of-government",
      name: "Heads of Government & Prime Ministers",
      description: "Official public timeline coverage of recognized national Prime Ministers and Heads of Government.",
      criteria: "Hold recognized national Head of Government mandate",
      autoQualify: true,
      isActive: true,
    },
    {
      id: "prog-heads-of-state",
      name: "Heads of State & Presidents",
      description: "Official public timeline coverage of recognized national Presidents and Sovereigns.",
      criteria: "Hold recognized national Head of State mandate",
      autoQualify: true,
      isActive: true,
    },
    {
      id: "prog-senior-diplomats",
      name: "Foreign Ministers & Senior Diplomats",
      description: "Coverage of bilateral treaties, multilateral summits, and diplomatic envoys.",
      criteria: "Credentialed treaty signatory or special envoy",
      autoQualify: false,
      isActive: true,
    },
    {
      id: "prog-diplomats-and-envoys",
      name: "Diplomatic Corps & Special Envoys",
      description: "International peace envoys, ambassadors to the UN, and chief negotiators.",
      criteria: "Accredited envoy or ambassador",
      autoQualify: false,
      isActive: true,
    },
    {
      id: "prog-legal-and-intelligence",
      name: "Judicial & Intelligence Leadership",
      description: "Coverage of ICJ/ICC judges, national intelligence chiefs, and special counsels.",
      criteria: "Appointed international judge or intelligence director",
      autoQualify: false,
      isActive: true,
    },
    {
      id: "prog-religious-leaders",
      name: "Major Religious Authorities",
      description: "Coverage of Chief Rabbis, Papal delegations, and major denominational authorities.",
      criteria: "Recognized titular leader of major denomination",
      autoQualify: false,
      isActive: true,
    },
    {
      id: "prog-global-figures",
      name: "Global & Cultural Figures",
      description: "Monitored historical and global cultural actors with significant public footprint.",
      criteria: "Documented global public footprint in historical records",
      autoQualify: false,
      isActive: true,
    },
    {
      id: "prog-middle-east-diplomacy",
      name: "Middle East Diplomacy & Regional Actors",
      description: "Diplomatic delegations, foreign ministers, and regional peace process actors.",
      criteria: "Accredited regional diplomatic delegation participant",
      autoQualify: false,
      isActive: true,
    },
    {
      id: "prog-corporate-executives",
      name: "Corporate & Technology Executives",
      description: "Technology founders, chief executive officers, and institutional leaders.",
      criteria: "Chief executive or founder of major institutional enterprise",
      autoQualify: false,
      isActive: true,
    },
    {
      id: "prog-journalists",
      name: "Media Commentators & Broadcast Journalists",
      description: "Network news anchors, foreign correspondents, and editorial commentators.",
      criteria: "National broadcast anchor or primary correspondent",
      autoQualify: false,
      isActive: true,
    },
    {
      id: "prog-world-royalty",
      name: "Sovereign Monarchs & Historic Royal Houses",
      description: "Official public timeline and forensic register of reigning European sovereigns and historic dynastic houses.",
      criteria: "Hold sovereign monarchical title or hereditary dynastic headship",
      autoQualify: true,
      isActive: true,
    },
  ];

  for (const prog of programmes) {
    await db
      .insert(schema.coverageProgrammes)
      .values(prog)
      .onConflictDoUpdate({
        target: schema.coverageProgrammes.id,
        set: {
          name: prog.name,
          description: prog.description,
          criteria: prog.criteria,
          autoQualify: prog.autoQualify,
          isActive: prog.isActive,
        },
      });
  }
  console.log(`✅ ${programmes.length} Coverage Programmes synchronized.`);

  // ---------------------------------------------------------
  // 2. Canonical People Catalog
  // ---------------------------------------------------------
  console.log(`\n👤 2. Synchronizing ${masterPeopleSeed.length} Canonical Public Figures...`);
  
  // Load existing people to match by ID or slug to avoid duplicate key violations
  const existingDbPeople = await db.select().from(schema.people);
  const existingPersonBySlug = new Map(existingDbPeople.map((p) => [p.slug, p]));
  const existingPersonById = new Map(existingDbPeople.map((p) => [p.id, p]));
  const resolvedPersonIdMap = new Map<string, string>(); // input ID/slug -> actual DB row ID

  // Populate resolved ID map with existing records
  existingDbPeople.forEach((p) => {
    resolvedPersonIdMap.set(p.id, p.id);
    resolvedPersonIdMap.set(p.slug, p.id);
  });

  for (const p of masterPeopleSeed) {
    const existingBySlug = existingPersonBySlug.get(p.slug);
    const existingById = existingPersonById.get(p.id);
    const targetId = existingBySlug?.id || existingById?.id || p.id;

    resolvedPersonIdMap.set(p.id, targetId);
    resolvedPersonIdMap.set(p.slug, targetId);

    const personValues = {
      id: targetId,
      slug: p.slug,
      canonicalName: p.canonicalName,
      displayName: p.displayName || p.canonicalName,
      nativeName: p.nativeName || null,
      fullBirthName: p.fullBirthName || null,
      birthDate: p.birthDate || null,
      deathDate: p.deathDate || null,
      datePrecision: p.datePrecision || "exact-day",
      nationality: p.nationality || null,
      citizenship: p.citizenship || [],
      nationalIdentity: p.nationalIdentity || null,
      ethnicity: p.ethnicity || null,
      ancestry: p.ancestry || null,
      religion: p.religion || null,
      religiousDenomination: p.religiousDenomination || null,
      religionStatus: p.religionStatus || "not-publicly-stated",
      languages: p.languages || [],
      primaryRole: p.primaryRole || null,
      classification: p.classification || "historical-figure",
      primaryFigureCategory: p.primaryFigureCategory || p.classification || "historical-figure",
      notabilityBasis: p.notabilityBasis || p.primaryRole || "Historical public figure",
      inclusionBasis: p.inclusionBasis || [],
      inclusionRationale: p.inclusionRationale || null,
      culturalImpactSummary: p.culturalImpactSummary || null,
      achievements: p.achievements ? (p.achievements as unknown as Record<string, unknown>[]) : null,
      inclusionContested: p.inclusionContested || false,
      inclusionContestationNote: p.inclusionContestationNote || null,
      programmeId: p.programmeId || "prog-heads-of-state",
      isLiving: p.isLiving,
      monitoringPriority: p.monitoringPriority || "normal",
      publicationStatus: "published", // Force published for live catalog visibility
      wikidataId: p.wikidataId || null,
      viafId: p.viafId || null,
      avatarUrl: p.avatarUrl || null,
      summary: p.summary || p.primaryRole || null,
      updatedAt: new Date(),
    };

    if (existingBySlug || existingById) {
      await db
        .update(schema.people)
        .set(personValues)
        .where(eq(schema.people.id, targetId));
    } else {
      await db
        .insert(schema.people)
        .values(personValues);
    }

    // Synchronize aliases
    const aliasesToInsert = Array.from(
      new Set([
        p.canonicalName,
        p.displayName,
        p.slug,
        p.id,
        targetId,
        ...(p.aliases || []),
        ...(p.nativeName ? [p.nativeName] : []),
      ].filter((a): a is string => Boolean(a && a.trim())))
    );

    for (const alias of aliasesToInsert) {
      await db
        .insert(schema.personAliases)
        .values({
          personId: targetId,
          alias,
          aliasType: alias === p.nativeName ? "native" : (p.aliases?.includes(alias) ? "transliteration" : "name"),
        })
        .onConflictDoNothing();
    }
  }

  // Check for any participant mentions in eventsCorpus that might need automatic fallback registration
  console.log("   Resolving and registering event participants...");
  for (const evt of eventsCorpus) {
    for (const part of evt.participants || []) {
      const canonicalId = PARTICIPANT_ID_ALIASES[part.personId] || part.personId;
      const resolvedId = resolvedPersonIdMap.get(canonicalId) || resolvedPersonIdMap.get((part as { slug?: string }).slug || "");

      if (!resolvedId) {
        const slug = (part as { slug?: string }).slug || canonicalId.replace(/^p-/, "");
        const fallbackPerson = {
          id: canonicalId,
          slug,
          canonicalName: part.name,
          displayName: part.name,
          nativeName: null,
          fullBirthName: null,
          birthDate: null,
          deathDate: null,
          datePrecision: "exact-day",
          nationality: "International",
          citizenship: [],
          nationalIdentity: null,
          ethnicity: null,
          ancestry: null,
          religion: null,
          religiousDenomination: null,
          religionStatus: "not-publicly-stated",
          languages: [],
          primaryRole: part.role || "Event Participant",
          classification: "diplomat",
          primaryFigureCategory: "diplomat",
          notabilityBasis: `Documented participant in historical event "${evt.eventName}"`,
          inclusionBasis: ["diplomatic-record" as const],
          inclusionRationale: "Accredited participant in documented international treaty or summit",
          culturalImpactSummary: null,
          achievements: null,
          inclusionContested: false,
          inclusionContestationNote: null,
          programmeId: "prog-senior-diplomats",
          isLiving: true,
          monitoringPriority: "normal",
          publicationStatus: "published",
          wikidataId: null,
          viafId: null,
          avatarUrl: null,
          summary: `Documented attendee at ${evt.eventName}`,
        };
        await db.insert(schema.people).values(fallbackPerson).onConflictDoNothing();
        resolvedPersonIdMap.set(canonicalId, canonicalId);
        resolvedPersonIdMap.set(slug, canonicalId);
      }
    }
  }

  console.log(`✅ People catalog synchronized (${resolvedPersonIdMap.size} figures resolved & published).`);

  // ---------------------------------------------------------
  // 3. Primary Sources Catalog
  // ---------------------------------------------------------
  console.log(`\n📚 3. Synchronizing Primary Sources...`);
  const allSources = [
    ...sourcesCorpus,
    ...(legacySources || []).map((s) => ({
      id: s.id,
      title: s.title,
      publisher: s.publisher,
      sourceType: s.sourceType,
      tier: (s.classification === "primary" ? "tier-a" : "tier-c") as "tier-a" | "tier-c",
      url: s.url || null,
      publicationDate: s.publicationDate || s.accessedDate || null,
      trustScore: s.classification === "primary" ? 1.0 : 0.8,
    })),
  ];

  const uniqueSources = Array.from(new Map(allSources.map((s) => [s.id, s])).values());

  for (const src of uniqueSources) {
    const srcValues = {
      id: src.id,
      title: src.title,
      publisher: src.publisher,
      sourceType: src.sourceType,
      tier: src.tier || "tier-c",
      url: src.url || null,
      archiveUrl: null,
      author: null,
      publicationDate: src.publicationDate || null,
      trustScore: src.trustScore ?? 1.0,
    };
    await db
      .insert(schema.sources)
      .values(srcValues)
      .onConflictDoUpdate({
        target: schema.sources.id,
        set: srcValues,
      });
  }
  console.log(`✅ ${uniqueSources.length} Primary Sources synchronized.`);

  // ---------------------------------------------------------
  // 4. Places & Venues Gazetteer
  // ---------------------------------------------------------
  console.log(`\n📍 4. Synchronizing Places Gazetteer...`);
  const allRawEvents = [...eventsCorpus, ...legacyEvents];
  const placesMap = new Map<string, typeof schema.places.$inferInsert>();

  for (const e of allRawEvents) {
    const city = (e.city || "Unknown").trim();
    const venue = ((e as { venueName?: string }).venueName || (e as { venue?: string }).venue || city).trim();
    const country = (e.country || "Unknown").trim();
    const placeSlug = `${city.toLowerCase().replace(/\s+/g, "-")}-${venue.toLowerCase().replace(/[^\w]/g, "-").slice(0, 25)}`;
    const placeId = `plc-${placeSlug}`;

    if (!placesMap.has(placeId)) {
      placesMap.set(placeId, {
        id: placeId,
        slug: placeSlug,
        venue,
        city,
        country,
        latitude: typeof e.latitude === "number" ? e.latitude : null,
        longitude: typeof e.longitude === "number" ? e.longitude : null,
        placeType: "venue",
      });
    }
  }

  for (const place of placesMap.values()) {
    await db
      .insert(schema.places)
      .values(place)
      .onConflictDoUpdate({
        target: schema.places.id,
        set: {
          venue: place.venue,
          city: place.city,
          country: place.country,
          latitude: place.latitude,
          longitude: place.longitude,
          placeType: place.placeType,
        },
      });
  }
  console.log(`✅ ${placesMap.size} Places synchronized.`);

  // ---------------------------------------------------------
  // 5. Historical Events Corpus
  // ---------------------------------------------------------
  console.log(`\n🗓️ 5. Synchronizing Historical Events Corpus (${eventsCorpus.length} Events)...`);
  for (const evt of eventsCorpus) {
    const city = (evt.city || "Unknown").trim();
    const venue = (evt.venueName || city).trim();
    const placeSlug = `${city.toLowerCase().replace(/\s+/g, "-")}-${venue.toLowerCase().replace(/[^\w]/g, "-").slice(0, 25)}`;
    const placeId = `plc-${placeSlug}`;

    const eventValues = {
      id: evt.id,
      slug: evt.slug,
      parentId: null,
      eventType: evt.eventTypes?.[0] || evt.categories?.[0] || "historical-action",
      title: evt.eventName,
      summary: evt.summary,
      description: evt.description || evt.summary || null,
      startDate: evt.startDate,
      endDate: evt.endDate || null,
      temporalPrecision: evt.datePrecision || "exact-day",
      dayOfWeek: evt.dayOfWeek || null,
      localStartTime: evt.localStartTime || null,
      localEndTime: evt.localEndTime || null,
      utcStartTime: evt.utcStartTime || null,
      utcEndTime: evt.utcEndTime || null,
      timezoneId: evt.timezoneId || null,
      utcOffsetSeconds: evt.utcOffsetSeconds || null,
      timezoneAbbreviation: evt.timezoneAbbreviation || null,
      dstObserved: evt.dstObserved || null,
      timezoneConfidence: evt.timezoneConfidence || null,
      timeConversionMethod: evt.timeConversionMethod || null,
      timeStandard: evt.timeStandard || null,
      durationSeconds: evt.durationSeconds || null,
      durationPrecision: evt.durationPrecision || null,
      durationBasis: evt.durationBasis || null,
      holidayApplicable: evt.holidayApplicable || false,
      holidayName: evt.holidayName || null,
      holidayType: evt.holidayType || null,
      holidayJurisdiction: evt.holidayJurisdiction || null,

      // Travel & Flight attributes
      isTravelEvent: evt.isTravelEvent || false,
      transportMode: evt.transportMode || null,
      flightIdentifier: evt.flightIdentifier || null,
      isDocumentedFlight: evt.isDocumentedFlight || false,
      flightCorridor: evt.flightCorridor || null,
      departureAirportIata: evt.departureAirportIata || null,
      arrivalAirportIata: evt.arrivalAirportIata || null,
      originWaypoint: evt.originWaypoint || null,
      destinationWaypoint: evt.destinationWaypoint || null,
      routeCoordinates: evt.routeCoordinates || null,
      travelInferences: evt.travelInferences || null,
      journeyLegs: evt.journeyLegs || null,

      placeId,
      verificationStatus: evt.verificationStatus || "verified",
      confidenceScore: evt.confidenceScore ?? (evt.confidence === "confirmed" ? 1.0 : (evt.confidence === "strong" ? 0.85 : 0.7)),
      publicationStatus: "published",
      publicationLane: "auto-publish",
      significanceScore: 90,
      updatedAt: new Date(),
    };

    // Execute in a transaction so deferred trigger trg_verify_published_event_sources passes upon commit
    await db.transaction(async (tx) => {
      await tx
        .insert(schema.events)
        .values(eventValues)
        .onConflictDoUpdate({
          target: schema.events.id,
          set: eventValues,
        });

      // Synchronize event sources (event_sources)
      let isPrimarySource = true;
      for (const sId of evt.sourceIds || []) {
        await tx
          .insert(schema.eventSources)
          .values({
            eventId: evt.id,
            sourceId: sId,
            isPrimary: isPrimarySource,
          })
          .onConflictDoNothing();
        isPrimarySource = false;
      }

      // Synchronize event participants (event_people)
      for (const part of evt.participants || []) {
        const canonicalPersonRef = PARTICIPANT_ID_ALIASES[part.personId] || part.personId;
        const dbPersonId = resolvedPersonIdMap.get(canonicalPersonRef) || resolvedPersonIdMap.get((part as { slug?: string }).slug || "") || canonicalPersonRef;
        const eventPersonId = `ep-${evt.id}-${dbPersonId}`;

        await tx
          .insert(schema.eventPeople)
          .values({
            id: eventPersonId,
            eventId: evt.id,
            personId: dbPersonId,
            involvementType: part.role === "attendee" ? "attendee" : "principal",
            roleLabel: part.role || "Participant",
            capacityTitle: part.role || "Delegate",
            attendanceMode: part.attendanceMode || "physical",
            presenceConfidence: part.presenceConfidence || "confirmed",
            roleConfidence: "confirmed",
          })
          .onConflictDoUpdate({
            target: schema.eventPeople.id,
            set: {
              roleLabel: part.role || "Participant",
              attendanceMode: part.attendanceMode || "physical",
              presenceConfidence: part.presenceConfidence || "confirmed",
            },
          });
      }

      // Synchronize quotes
      for (const q of evt.quotes || []) {
        const matchedPerson = masterPeopleSeed.find((p) => p.canonicalName === q.speaker || p.displayName === q.speaker);
        const speakerRef = matchedPerson?.id || evt.participants?.[0]?.personId;
        if (speakerRef) {
          const canonicalSpeakerRef = PARTICIPANT_ID_ALIASES[speakerRef] || speakerRef;
          const dbSpeakerId = resolvedPersonIdMap.get(canonicalSpeakerRef) || canonicalSpeakerRef;

          await tx
            .insert(schema.quotes)
            .values({
              id: `qt-${evt.id}-${Math.random().toString(36).substring(2, 8)}`,
              eventId: evt.id,
              speakerId: dbSpeakerId,
              quote: q.text,
              language: q.language || "en",
              sourceId: evt.sourceIds?.[0] || null,
              timestampInMedia: q.timestamp || null,
            })
            .onConflictDoNothing();
        }
      }

      // Synchronize claims
      for (let idx = 0; idx < (evt.participants || []).length; idx++) {
        const part = evt.participants![idx];
        const canonicalPersonRef = PARTICIPANT_ID_ALIASES[part.personId] || part.personId;
        const dbPersonId = resolvedPersonIdMap.get(canonicalPersonRef) || resolvedPersonIdMap.get((part as { slug?: string }).slug || "") || canonicalPersonRef;

        await tx
          .insert(schema.claims)
          .values({
            id: `clm-${evt.id}-${idx}`,
            eventId: evt.id,
            subjectId: dbPersonId,
            subjectEntityType: "person",
            subjectEntityId: dbPersonId,
            claimType: "presence",
            statement: `${part.name} was documented in attendance at ${evt.eventName} in ${evt.city} on ${evt.startDate}.`,
            claimedTime: evt.localStartTime || evt.startDate,
            claimedVenue: evt.venueName || evt.city,
            sourceId: evt.sourceIds?.[0] || null,
            confidence: part.presenceConfidence === "confirmed" ? "confirmed" : "limited",
            claimStatus: "ESTABLISHED",
            epistemicClass: "documented fact",
            supportingExcerpt: evt.summary,
          })
          .onConflictDoNothing();
      }
    });
  }

  // ---------------------------------------------------------
  // 6. Topics & Roles & Milestones
  // ---------------------------------------------------------
  console.log(`\n🏷️ 6. Synchronizing Topics, Roles & Milestones...`);
  for (const topic of topicsSeed || []) {
    await db
      .insert(schema.topics)
      .values({
        id: topic.id,
        slug: topic.slug,
        name: topic.name,
        category: topic.category,
        summary: topic.summary,
        startedDate: topic.startedDate,
        endedDate: topic.endedDate,
      })
      .onConflictDoNothing();
  }

  for (const role of officialRolesSeed || []) {
    const dbPersonId = resolvedPersonIdMap.get(role.personId);
    if (dbPersonId) {
      await db
        .insert(schema.personRoles)
        .values({
          personId: dbPersonId,
          title: role.title,
          startDate: role.startDate,
          endDate: role.endDate,
          isCurrent: role.isCurrent,
        })
        .onConflictDoNothing();
    }
  }

  for (const m of milestonesSeed || []) {
    const dbPersonId = resolvedPersonIdMap.get(m.personId);
    if (dbPersonId) {
      await db
        .insert(schema.personMilestones)
        .values({
          personId: dbPersonId,
          title: m.title,
          category: m.category,
          date: m.date,
          year: m.year,
          description: m.description,
          metricOrStat: m.metricOrStat,
          sourceId: m.sourceId || null,
        })
        .onConflictDoNothing();
    }
  }

  // Synchronize Structured Biographical Dossiers
  console.log(`   Synchronizing Structured Biographical Records (Education, Career, Awards, Works, Stays)...`);
  for (const edu of royalEducationSeed || []) {
    const dbPersonId = resolvedPersonIdMap.get(edu.personId) || edu.personId;
    await db
      .insert(schema.personEducation)
      .values({
        id: edu.id,
        personId: dbPersonId,
        institution: edu.institution,
        degree: edu.degree || null,
        subject: edu.fieldOfStudy || null,
        startDate: edu.startYear || null,
        endDate: edu.endYear || null,
        qualification: edu.degree || null,
        completedStatus: "completed",
        sourceId: edu.sourceId || null,
      })
      .onConflictDoUpdate({
        target: schema.personEducation.id,
        set: {
          institution: edu.institution,
          degree: edu.degree || null,
          subject: edu.fieldOfStudy || null,
          startDate: edu.startYear || null,
          endDate: edu.endYear || null,
          qualification: edu.degree || null,
          completedStatus: "completed",
          sourceId: edu.sourceId || null,
        },
      });
  }

  for (const car of royalCareerSeed || []) {
    const dbPersonId = resolvedPersonIdMap.get(car.personId) || car.personId;
    await db
      .insert(schema.personCareer)
      .values({
        id: car.id,
        personId: dbPersonId,
        organisationName: car.organisationName,
        positionTitle: car.roleTitle,
        startDate: car.startDate || null,
        endDate: car.endDate || null,
        notes: car.notes || null,
        sourceId: car.sourceId || null,
      })
      .onConflictDoUpdate({
        target: schema.personCareer.id,
        set: {
          organisationName: car.organisationName,
          positionTitle: car.roleTitle,
          startDate: car.startDate || null,
          endDate: car.endDate || null,
          notes: car.notes || null,
          sourceId: car.sourceId || null,
        },
      });
  }

  for (const awd of royalAwardsSeed || []) {
    const dbPersonId = resolvedPersonIdMap.get(awd.personId) || awd.personId;
    const yearInt = awd.yearReceived ? parseInt(awd.yearReceived, 10) || null : null;
    await db
      .insert(schema.personAwards)
      .values({
        id: awd.id,
        personId: dbPersonId,
        awardName: awd.awardName,
        awardingBody: awd.awardingBody || null,
        awardYear: yearInt,
        citationReason: awd.citation || null,
        result: "winner",
        sourceId: awd.sourceId || null,
      })
      .onConflictDoUpdate({
        target: schema.personAwards.id,
        set: {
          awardName: awd.awardName,
          awardingBody: awd.awardingBody || null,
          awardYear: yearInt,
          citationReason: awd.citation || null,
          result: "winner",
          sourceId: awd.sourceId || null,
        },
      });
  }

  for (const wrk of royalWorksSeed || []) {
    const dbPersonId = resolvedPersonIdMap.get(wrk.personId) || wrk.personId;
    await db
      .insert(schema.personWorks)
      .values({
        id: wrk.id,
        personId: dbPersonId,
        workTitle: wrk.title,
        workType: wrk.workType,
        releaseDate: wrk.publicationYear || null,
        publisherOrVenue: wrk.publisher || null,
        significanceNote: wrk.notes || null,
        sourceId: wrk.sourceId || null,
      })
      .onConflictDoUpdate({
        target: schema.personWorks.id,
        set: {
          workTitle: wrk.title,
          workType: wrk.workType,
          releaseDate: wrk.publicationYear || null,
          publisherOrVenue: wrk.publisher || null,
          significanceNote: wrk.notes || null,
          sourceId: wrk.sourceId || null,
        },
      });
  }

  for (const sty of royalStaysSeed || []) {
    const dbPersonId = resolvedPersonIdMap.get(sty.personId) || sty.personId;
    await db
      .insert(schema.personStays)
      .values({
        id: sty.id,
        personId: dbPersonId,
        venueName: sty.venueName,
        stayName: sty.stayName || null,
        stayType: sty.stayType,
        city: sty.city,
        country: sty.country,
        latitude: sty.latitude,
        longitude: sty.longitude,
        startDate: sty.startDate,
        endDate: sty.endDate || null,
        isBaseOfOperations: sty.isBaseOfOperations,
        isPrimaryResidence: sty.isPrimaryResidence,
        securityLevel: sty.securityLevel || null,
        notes: sty.notes || null,
        sourceId: sty.sourceId || null,
      })
      .onConflictDoUpdate({
        target: schema.personStays.id,
        set: {
          venueName: sty.venueName,
          stayName: sty.stayName || null,
          stayType: sty.stayType,
          city: sty.city,
          country: sty.country,
          latitude: sty.latitude,
          longitude: sty.longitude,
          startDate: sty.startDate,
          endDate: sty.endDate || null,
          isBaseOfOperations: sty.isBaseOfOperations,
          isPrimaryResidence: sty.isPrimaryResidence,
          securityLevel: sty.securityLevel || null,
          notes: sty.notes || null,
        },
      });
  }

  // ---------------------------------------------------------
  // 7. Live Verification & Statistics
  // ---------------------------------------------------------
  console.log("\n================================================================================");
  console.log("📊 Final Live Database Row Counts in Supabase PostgreSQL:");
  console.log("================================================================================");
  const [
    [{ count: peopleCount }],
    [{ count: eventsCount }],
    [{ count: sourcesCount }],
    [{ count: placesCount }],
    [{ count: eventPeopleCount }],
    [{ count: quotesCount }],
    [{ count: claimsCount }],
    [{ count: eduCount }],
    [{ count: careerCount }],
    [{ count: awardsCount }],
    [{ count: worksCount }],
    [{ count: staysCount }],
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(schema.people),
    db.select({ count: sql<number>`count(*)::int` }).from(schema.events),
    db.select({ count: sql<number>`count(*)::int` }).from(schema.sources),
    db.select({ count: sql<number>`count(*)::int` }).from(schema.places),
    db.select({ count: sql<number>`count(*)::int` }).from(schema.eventPeople),
    db.select({ count: sql<number>`count(*)::int` }).from(schema.quotes),
    db.select({ count: sql<number>`count(*)::int` }).from(schema.claims),
    db.select({ count: sql<number>`count(*)::int` }).from(schema.personEducation),
    db.select({ count: sql<number>`count(*)::int` }).from(schema.personCareer),
    db.select({ count: sql<number>`count(*)::int` }).from(schema.personAwards),
    db.select({ count: sql<number>`count(*)::int` }).from(schema.personWorks),
    db.select({ count: sql<number>`count(*)::int` }).from(schema.personStays),
  ]);

  console.log(`- People:        ${peopleCount}`);
  console.log(`- Events:        ${eventsCount}`);
  console.log(`- Sources:       ${sourcesCount}`);
  console.log(`- Places:        ${placesCount}`);
  console.log(`- Participants:  ${eventPeopleCount}`);
  console.log(`- Quotes:        ${quotesCount}`);
  console.log(`- Claims:        ${claimsCount}`);
  console.log(`- Education:     ${eduCount}`);
  console.log(`- Careers:       ${careerCount}`);
  console.log(`- Awards:        ${awardsCount}`);
  console.log(`- Works:         ${worksCount}`);
  console.log(`- Stays:         ${staysCount}`);
  console.log("================================================================================");
  console.log("🎉 Live Database Ingestion & Corpus Synchronization Complete!");
}

syncCorpus()
  .catch((err) => {
    console.error("❌ Synchronization Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await client.end();
  });
