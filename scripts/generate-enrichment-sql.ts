import { GLOBAL_GAZETTEER_METADATA, resolveVenueMetadata } from "../lib/rewind/places";
import { sanitizePlaceSlug } from "../lib/rewind/utils";
import { masterPeopleSeed, statesmenAndDiplomatsSeed } from "../data/seeds/index";
import { eventsCorpus } from "../data/seeds/events-corpus";
import { events as legacyEvents } from "../archive/legacy-data/rewind";

export function escapeSql(val: unknown): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
  if (typeof val === "number") return isNaN(val) ? "NULL" : String(val);
  if (Array.isArray(val)) {
    const arrItems = val.map((v) => `"${String(v).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`).join(",");
    const escapedArr = arrItems.replace(/'/g, "''");
    return `'{${escapedArr}}'`;
  }
  const str = String(val).replace(/'/g, "''");
  return `'${str}'`;
}

export function generateAllEnrichmentSql(): {
  placesSql: string[];
  addressesSql: string[];
  venuesSql: string[];
  venueAreasSql: string[];
  eventsSql: string[];
  peopleSql: string[];
  rolesSql: string[];
} {
  const placesSql: string[] = [
    `INSERT INTO public.places (id, slug, venue, city, country, latitude, longitude, place_type)
     VALUES ('plc-wolverton-works', 'wolverton-works', 'Wolverton Works', 'Milton Keynes', 'United Kingdom', 52.0622, -0.8142, 'maintenance-depot')
     ON CONFLICT (id) DO NOTHING;`
  ];

  // 1. Build Addresses and Venues maps from GLOBAL_GAZETTEER_METADATA
  const uniqueVenues = new Map<string, typeof GLOBAL_GAZETTEER_METADATA[string]>();
  for (const [, meta] of Object.entries(GLOBAL_GAZETTEER_METADATA)) {
    if (!uniqueVenues.has(meta.canonicalVenue)) {
      uniqueVenues.set(meta.canonicalVenue, meta);
    }
  }

  const addressesSql: string[] = [];
  const venuesSql: string[] = [];
  const venueAreasSql: string[] = [];

  for (const [, meta] of uniqueVenues) {
    const venueSlug = sanitizePlaceSlug(meta.canonicalVenue);
    const citySlug = sanitizePlaceSlug(meta.city);
    const countrySlug = sanitizePlaceSlug(meta.country);
    const venueId = `ven-${countrySlug}-${citySlug}-${venueSlug}`;

    let addressId: string | null = null;
    if (!meta.isMobileVessel) {
      addressId = `addr-${countrySlug}-${citySlug}-${venueSlug}`;
      const formatted = `${meta.streetAddress ? meta.streetAddress + ", " : ""}${meta.city}, ${meta.country}`;
      addressesSql.push(
        `INSERT INTO public.addresses (id, country_code, building_name, street_name, district, city, formatted_local, formatted_english, latitude, longitude)
         VALUES (${escapeSql(addressId)}, ${escapeSql(meta.countryCode)}, ${escapeSql(meta.canonicalVenue)}, ${escapeSql(meta.streetAddress || null)}, ${escapeSql(meta.district || null)}, ${escapeSql(meta.city)}, ${escapeSql(formatted)}, ${escapeSql(formatted)}, ${escapeSql(meta.latitude)}, ${escapeSql(meta.longitude)})
         ON CONFLICT (id) DO UPDATE SET
           country_code = EXCLUDED.country_code,
           building_name = EXCLUDED.building_name,
           street_name = EXCLUDED.street_name,
           district = EXCLUDED.district,
           city = EXCLUDED.city,
           formatted_local = EXCLUDED.formatted_local,
           formatted_english = EXCLUDED.formatted_english,
           latitude = EXCLUDED.latitude,
           longitude = EXCLUDED.longitude;`
      );
    }

    venuesSql.push(
      `INSERT INTO public.venues (id, name, address_id, is_mobile_vessel, home_base_place_id, vessel_type, latitude, longitude)
       VALUES (${escapeSql(venueId)}, ${escapeSql(meta.canonicalVenue)}, ${escapeSql(addressId)}, ${escapeSql(Boolean(meta.isMobileVessel))}, ${escapeSql(meta.homeBasePlaceId || null)}, ${escapeSql(meta.vesselType || null)}, ${escapeSql(meta.latitude)}, ${escapeSql(meta.longitude)})
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         address_id = EXCLUDED.address_id,
         is_mobile_vessel = EXCLUDED.is_mobile_vessel,
         home_base_place_id = EXCLUDED.home_base_place_id,
         vessel_type = EXCLUDED.vessel_type,
         latitude = EXCLUDED.latitude,
         longitude = EXCLUDED.longitude;`
    );

    for (const area of meta.venueAreas || []) {
      venueAreasSql.push(
        `INSERT INTO public.venue_areas (id, venue_id, name, area_type, latitude, longitude)
         VALUES (${escapeSql(area.id)}, ${escapeSql(venueId)}, ${escapeSql(area.name)}, ${escapeSql(area.areaType)}, ${escapeSql(meta.latitude)}, ${escapeSql(meta.longitude)})
         ON CONFLICT (id) DO UPDATE SET
           venue_id = EXCLUDED.venue_id,
           name = EXCLUDED.name,
           area_type = EXCLUDED.area_type,
           latitude = EXCLUDED.latitude,
           longitude = EXCLUDED.longitude;`
      );
    }
  }

  // 2. Events SQL (set venue_id, address_id, description)
  const allEvents = [...eventsCorpus, ...legacyEvents];
  const eventsSql: string[] = [];

  for (const evt of allEvents) {
    const rawVenue = ((evt as { venueName?: string }).venueName || (evt as { venue?: string }).venue || "").trim();
    const meta = rawVenue ? resolveVenueMetadata(rawVenue) : null;
    let venueId: string | null = null;
    let addressId: string | null = null;

    if (meta) {
      const venueSlug = sanitizePlaceSlug(meta.canonicalVenue);
      const citySlug = sanitizePlaceSlug(meta.city);
      const countrySlug = sanitizePlaceSlug(meta.country);
      venueId = `ven-${countrySlug}-${citySlug}-${venueSlug}`;
      if (!meta.isMobileVessel) {
        addressId = `addr-${countrySlug}-${citySlug}-${venueSlug}`;
      }
    }

    const desc = (evt as { description?: string }).description || evt.summary || null;
    const venueUpdateSql = meta ? `venue_id = ${escapeSql(venueId)}` : `venue_id = venue_id`;
    const addressUpdateSql = meta
      ? (meta.isMobileVessel ? `address_id = NULL` : `address_id = COALESCE(${escapeSql(addressId)}, address_id)`)
      : `address_id = address_id`;

    eventsSql.push(
      `UPDATE public.events SET
         ${venueUpdateSql},
         ${addressUpdateSql},
         description = COALESCE(description, ${escapeSql(desc)})
       WHERE id = ${escapeSql(evt.id)};`
    );
  }

  // 3. People SQL
  const peopleSql: string[] = [];

  // A. Royal Aliases to canonical
  const royalAliasMap: Record<string, string> = {
    "abdullah-bin-zayed": "abdullah-bin-zayed-al-nahyan",
    "abdullatif-al-zayani": "abdullatif-bin-rashid-al-zayani",
    "abdullah-saudi": "crown-prince-abdullah-bin-abdulaziz",
    "crown-prince-alexander-serbia": "alexander-crown-prince-yugoslavia",
    "crown-prince-haakon": "haakon-crown-prince-norway",
    "crown-prince-pavlos-greece": "pavlos-crown-prince-greece",
    "crown-princess-victoria": "victoria-crown-princess-sweden",
    "grand-duchess-maria-teresa": "maria-teresa-luxembourg",
    "grand-duke-henri": "henri-luxembourg",
    "hereditary-grand-duke-guillaume": "guillaume-hereditary-grand-duke-luxembourg",
    "hereditary-prince-alois": "alois-hereditary-prince-liechtenstein",
    "infanta-sofia": "infanta-sofia-spain",
    "king-carl-xvi-gustaf": "carl-xvi-gustaf-sweden",
    "king-felipe-vi": "felipe-vi-spain",
    "king-frederik-x": "frederik-x-denmark",
    "king-harald-v": "harald-v-norway",
    "king-philippe-belgium": "philippe-belgium",
    "king-willem-alexander": "willem-alexander-netherlands",
    "margareta-custodian-romanian-crown": "margareta-custodian-of-the-crown-romania",
    "prince-albert-ii": "albert-ii-monaco",
    "prince-edward": "prince-edward-duke-of-edinburgh",
    "prince-george": "prince-george-of-wales",
    "prince-louis": "prince-louis-of-wales",
    "princess-catharina-amalia": "catharina-amalia-netherlands",
    "princess-charlene": "princess-charlene-monaco",
    "princess-charlotte": "princess-charlotte-of-wales",
    "princess-leonor": "leonor-princess-of-asturias",
    "queen-letizia": "queen-letizia-spain",
    "queen-margrethe-ii": "margrethe-ii-denmark",
    "queen-maxima": "queen-maxima-netherlands",
    "tsar-simeon-ii-bulgaria": "simeon-ii-bulgaria",
    "abraham-herzog": "yitzhak-halevi-herzog",
  };

  for (const [aliasId, canonicalId] of Object.entries(royalAliasMap)) {
    const canonical = masterPeopleSeed.find((p) => p.id === canonicalId || p.slug === canonicalId);
    if (canonical) {
      peopleSql.push(
        `UPDATE public.people SET
           birth_date = COALESCE(birth_date, ${escapeSql(canonical.birthDate)}),
           death_date = COALESCE(death_date, ${escapeSql(canonical.deathDate)}),
           native_name = COALESCE(native_name, ${escapeSql(canonical.nativeName)}),
           full_birth_name = COALESCE(full_birth_name, ${escapeSql(canonical.fullBirthName || null)}),
           nationality = CASE WHEN nationality = 'International' OR nationality IS NULL THEN ${escapeSql(canonical.nationality)} ELSE nationality END,
           citizenship = CASE WHEN citizenship IS NULL OR cardinality(citizenship) = 0 THEN ${escapeSql(canonical.citizenship || [canonical.nationality])} ELSE citizenship END,
           national_identity = COALESCE(national_identity, ${escapeSql(canonical.nationalIdentity || null)}),
           ethnicity = COALESCE(ethnicity, ${escapeSql(canonical.ethnicity || null)}),
           ancestry = COALESCE(ancestry, ${escapeSql(canonical.ancestry || null)}),
           religion = COALESCE(religion, ${escapeSql(canonical.religion || null)}),
           religious_denomination = COALESCE(religious_denomination, ${escapeSql(canonical.religiousDenomination || null)}),
           religion_status = CASE WHEN religion_status = 'not-publicly-stated' OR religion_status IS NULL THEN ${escapeSql(canonical.religionStatus || "self-identified")} ELSE religion_status END,
           languages = CASE WHEN languages IS NULL OR cardinality(languages) = 0 THEN ${escapeSql(canonical.languages || ["English"])} ELSE languages END,
           classification = ${escapeSql(canonical.classification)},
           primary_figure_category = ${escapeSql(canonical.primaryFigureCategory || canonical.classification)},
           notability_basis = COALESCE(notability_basis, ${escapeSql(canonical.notabilityBasis)}),
           inclusion_basis = CASE WHEN inclusion_basis IS NULL OR cardinality(inclusion_basis) = 0 THEN ${escapeSql(canonical.inclusionBasis || ["monarch-royal"])} ELSE inclusion_basis END,
           inclusion_rationale = COALESCE(inclusion_rationale, ${escapeSql(canonical.inclusionRationale)}),
           cultural_impact_summary = COALESCE(cultural_impact_summary, ${escapeSql(canonical.culturalImpactSummary)}),
           wikidata_id = COALESCE(wikidata_id, ${escapeSql(canonical.wikidataId)}),
           viaf_id = COALESCE(viaf_id, ${escapeSql(canonical.viafId)}),
           summary = COALESCE(summary, ${escapeSql(canonical.summary)})
         WHERE id = ${escapeSql(aliasId)};`
      );
    }
  }

  // B. Statesmen and Diplomats
  for (const p of statesmenAndDiplomatsSeed) {
    peopleSql.push(
      `INSERT INTO public.people (
         id, slug, canonical_name, display_name, native_name, full_birth_name,
         birth_date, death_date, date_precision, nationality, citizenship,
         national_identity, ethnicity, ancestry, religion, religious_denomination,
         religion_status, languages, primary_role, classification, primary_figure_category,
         notability_basis, inclusion_basis, inclusion_rationale, cultural_impact_summary,
         programme_id, is_living, monitoring_priority, publication_status,
         wikidata_id, viaf_id, summary
       ) VALUES (
         COALESCE((SELECT id FROM public.people WHERE slug = ${escapeSql(p.slug)} OR id = ${escapeSql(p.id)} LIMIT 1), ${escapeSql(p.id)}),
         ${escapeSql(p.slug)}, ${escapeSql(p.canonicalName)}, ${escapeSql(p.displayName)},
         ${escapeSql(p.nativeName)}, ${escapeSql(p.fullBirthName || null)}, ${escapeSql(p.birthDate)},
         ${escapeSql(p.deathDate)}, ${escapeSql(p.datePrecision)}, ${escapeSql(p.nationality)},
         ${escapeSql(p.citizenship || [p.nationality])}, ${escapeSql(p.nationalIdentity || null)},
         ${escapeSql(p.ethnicity || null)}, ${escapeSql(p.ancestry || null)}, ${escapeSql(p.religion || null)},
         ${escapeSql(p.religiousDenomination || null)}, ${escapeSql(p.religionStatus || "self-identified")},
         ${escapeSql(p.languages || ["English"])}, ${escapeSql(p.primaryRole)}, ${escapeSql(p.classification)},
         ${escapeSql(p.primaryFigureCategory || p.classification)}, ${escapeSql(p.notabilityBasis)},
         ${escapeSql(p.inclusionBasis || ["senior-diplomatic-or-geopolitical"])}, ${escapeSql(p.inclusionRationale)},
         ${escapeSql(p.culturalImpactSummary || null)}, ${escapeSql(p.programmeId)}, ${escapeSql(p.isLiving)},
         ${escapeSql(p.monitoringPriority)}, ${escapeSql(p.publicationStatus)}, ${escapeSql(p.wikidataId)},
         ${escapeSql(p.viafId)}, ${escapeSql(p.summary)}
       )
       ON CONFLICT (id) DO UPDATE SET
         slug = EXCLUDED.slug,
         canonical_name = EXCLUDED.canonical_name,
         display_name = EXCLUDED.display_name,
         native_name = COALESCE(EXCLUDED.native_name, public.people.native_name),
         full_birth_name = COALESCE(EXCLUDED.full_birth_name, public.people.full_birth_name),
         birth_date = COALESCE(EXCLUDED.birth_date, public.people.birth_date),
         death_date = COALESCE(EXCLUDED.death_date, public.people.death_date),
         nationality = EXCLUDED.nationality,
         citizenship = EXCLUDED.citizenship,
         national_identity = COALESCE(EXCLUDED.national_identity, public.people.national_identity),
         ethnicity = COALESCE(EXCLUDED.ethnicity, public.people.ethnicity),
         ancestry = COALESCE(EXCLUDED.ancestry, public.people.ancestry),
         religion = COALESCE(EXCLUDED.religion, public.people.religion),
         religious_denomination = COALESCE(EXCLUDED.religious_denomination, public.people.religious_denomination),
         religion_status = EXCLUDED.religion_status,
         languages = EXCLUDED.languages,
         primary_role = EXCLUDED.primary_role,
         classification = EXCLUDED.classification,
         primary_figure_category = EXCLUDED.primary_figure_category,
         notability_basis = EXCLUDED.notability_basis,
         inclusion_basis = EXCLUDED.inclusion_basis,
         inclusion_rationale = EXCLUDED.inclusion_rationale,
         cultural_impact_summary = COALESCE(EXCLUDED.cultural_impact_summary, public.people.cultural_impact_summary),
         is_living = EXCLUDED.is_living,
         wikidata_id = COALESCE(EXCLUDED.wikidata_id, public.people.wikidata_id),
         viaf_id = COALESCE(EXCLUDED.viaf_id, public.people.viaf_id),
         summary = EXCLUDED.summary;`
    );
  }

  // C. Update masterPeopleSeed inclusion fields and demographics for existing people
  for (const p of masterPeopleSeed) {
    const hasTechImpact = (p.inclusionBasis || []).includes("scientific-or-technological-impact");
    const inclusionBasisSql = hasTechImpact
      ? `CASE
           WHEN inclusion_basis IS NULL OR cardinality(inclusion_basis) = 0 THEN ${escapeSql(p.inclusionBasis || ["substantial-independent-coverage"])}
           WHEN NOT ('scientific-or-technological-impact' = ANY(inclusion_basis)) THEN array_append(inclusion_basis, 'scientific-or-technological-impact')
           ELSE inclusion_basis
         END`
      : `CASE WHEN inclusion_basis IS NULL OR cardinality(inclusion_basis) = 0 THEN ${escapeSql(p.inclusionBasis || ["substantial-independent-coverage"])} ELSE inclusion_basis END`;

    peopleSql.push(
      `UPDATE public.people SET
         inclusion_basis = ${inclusionBasisSql},
         inclusion_rationale = COALESCE(inclusion_rationale, ${escapeSql(p.inclusionRationale || null)}),
         cultural_impact_summary = COALESCE(cultural_impact_summary, ${escapeSql(p.culturalImpactSummary || null)}),
         wikidata_id = COALESCE(wikidata_id, ${escapeSql(p.wikidataId || null)}),
         viaf_id = COALESCE(viaf_id, ${escapeSql(p.viafId || null)}),
         native_name = COALESCE(native_name, ${escapeSql(p.nativeName || null)}),
         full_birth_name = COALESCE(full_birth_name, ${escapeSql(p.fullBirthName || null)}),
         religion = COALESCE(religion, ${escapeSql(p.religion || null)}),
         ethnicity = COALESCE(ethnicity, ${escapeSql(p.ethnicity || null)}),
         ancestry = COALESCE(ancestry, ${escapeSql(p.ancestry || null)}),
         national_identity = COALESCE(national_identity, ${escapeSql(p.nationalIdentity || null)})
       WHERE slug = ${escapeSql(p.slug)} OR id = ${escapeSql(p.id)};`
    );
  }

  // D. Legacy p-* records fix
  const legacyInclusionMap: Record<string, { basis: string[]; rationale: string; nat: string; lang: string[] }> = {
    "p-schneerson": {
      basis: ["major-religious-authority", "scholarly-historiographical-subject", "substantial-independent-coverage"],
      rationale: "Seventh Lubavitcher Rebbe; recognized global religious authority who led the worldwide Chabad-Lubavitch renaissance.",
      nat: "American / Russian",
      lang: ["Yiddish", "Hebrew", "Russian", "English"],
    },
    "p-hussein": {
      basis: ["head-of-state-or-government", "treaty-signatory", "substantial-independent-coverage"],
      rationale: "King of the Hashemite Kingdom of Jordan (1952–1999); signatory of the 1994 Israel–Jordan Treaty of Peace and Camp David mediator.",
      nat: "Jordanian",
      lang: ["Arabic", "English"],
    },
    "p-mubarak": {
      basis: ["head-of-state-or-government", "senior-diplomatic-or-geopolitical", "substantial-independent-coverage"],
      rationale: "President of the Arab Republic of Egypt (1981–2011); steward of the Egypt–Israel Peace Treaty and host of regional peace summits.",
      nat: "Egyptian",
      lang: ["Arabic", "English"],
    },
    "p-dole": {
      basis: ["parliamentary-leader", "substantial-independent-coverage"],
      rationale: "United States Senate Majority Leader, 1996 Republican presidential nominee, and sponsor of the Jerusalem Embassy Act of 1995.",
      nat: "American",
      lang: ["English"],
    },
    "p-rose": {
      basis: ["substantial-independent-coverage", "central-nexus-to-historical-events"],
      rationale: "Host of the Charlie Rose broadcast program; conducted multiple long-form interviews with international heads of state.",
      nat: "American",
      lang: ["English"],
    },
    "p-ivanov": {
      basis: ["senior-diplomatic-or-geopolitical", "cabinet-minister", "substantial-independent-coverage"],
      rationale: "Foreign Minister of the Russian Federation (1998–2004); Russian representative in Middle East Quartet diplomacy.",
      nat: "Russian",
      lang: ["Russian", "Spanish", "English"],
    },
    "p-giuliani": {
      basis: ["head-of-state-or-government", "substantial-independent-coverage"],
      rationale: "107th Mayor of New York City; prominent public figure during September 11 attacks and Middle East counter-terror solidarity.",
      nat: "American",
      lang: ["English"],
    },
    "p-fischer": {
      basis: ["substantial-independent-coverage", "central-nexus-to-historical-events"],
      rationale: "Governor of the Bank of Israel and Vice Chair of the Federal Reserve; architect of macroeconomic and fiscal reforms.",
      nat: "Israeli / American",
      lang: ["English", "Hebrew"],
    },
    "p-shalom": {
      basis: ["cabinet-minister", "senior-diplomatic-or-geopolitical", "substantial-independent-coverage"],
      rationale: "Deputy Prime Minister and Minister of Foreign Affairs of Israel (2003–2006); conducted diplomatic outreach during disengagement.",
      nat: "Israeli",
      lang: ["Hebrew", "Arabic", "French", "English"],
    },
    "p-rubio": {
      basis: ["senior-diplomatic-or-geopolitical", "parliamentary-leader", "substantial-independent-coverage"],
      rationale: "United States Secretary of State (2025–present) and former Vice Chairman of the Senate Select Committee on Intelligence.",
      nat: "American",
      lang: ["English", "Spanish"],
    },
    "p-faulkner": {
      basis: ["substantial-independent-coverage", "central-nexus-to-historical-events"],
      rationale: "Host of The Faulkner Focus and national television journalist covering major diplomatic developments and breaking news.",
      nat: "American",
      lang: ["English"],
    },
    "p-van-susteren": {
      basis: ["substantial-independent-coverage", "central-nexus-to-historical-events"],
      rationale: "Broadcast legal analyst and host of On the Record and The Record; interviewed world leaders across four decades.",
      nat: "American",
      lang: ["English"],
    },
    "p-levin": {
      basis: ["substantial-independent-coverage", "central-nexus-to-historical-events"],
      rationale: "Constitutional attorney and host of Life, Liberty & Levin; conducted nationally televised interviews with foreign heads of government.",
      nat: "American",
      lang: ["English"],
    },
    "p-baier": {
      basis: ["substantial-independent-coverage", "central-nexus-to-historical-events"],
      rationale: "Chief Political Anchor of Fox News and host of Special Report; conducted landmark interviews in Saudi Arabia and Israel.",
      nat: "American",
      lang: ["English"],
    },
    "p-karl": {
      basis: ["substantial-independent-coverage", "central-nexus-to-historical-events"],
      rationale: "Chief Washington Correspondent for ABC News and co-anchor of This Week; covered diplomatic summits and presidential travels.",
      nat: "American",
      lang: ["English"],
    },
  };

  for (const [id, data] of Object.entries(legacyInclusionMap)) {
    peopleSql.push(
      `UPDATE public.people SET
         inclusion_basis = ${escapeSql(data.basis)},
         inclusion_rationale = ${escapeSql(data.rationale)},
         nationality = CASE WHEN nationality = 'International' OR nationality IS NULL THEN ${escapeSql(data.nat)} ELSE nationality END,
         languages = CASE WHEN languages IS NULL OR cardinality(languages) = 0 THEN ${escapeSql(data.lang)} ELSE languages END
       WHERE id = ${escapeSql(id)};`
    );
  }

  // 4. Official Roles for newly enriched statesmen
  const newRoles = [
    { personId: "warren-christopher", title: "63rd United States Secretary of State", org: "US Department of State", start: "1993-01-20", end: "1997-01-17", curr: false },
    { personId: "warren-christopher", title: "Deputy Secretary of State", org: "US Department of State", start: "1977-02-26", end: "1981-01-20", curr: false },
    { personId: "cyrus-vance", title: "57th United States Secretary of State", org: "US Department of State", start: "1977-01-23", end: "1980-04-28", curr: false },
    { personId: "george-shultz", title: "60th United States Secretary of State", org: "US Department of State", start: "1982-07-16", end: "1989-01-20", curr: false },
    { personId: "george-shultz", title: "62nd United States Secretary of the Treasury", org: "US Department of the Treasury", start: "1972-06-12", end: "1974-05-08", curr: false },
    { personId: "james-baker", title: "61st United States Secretary of State", org: "US Department of State", start: "1989-01-25", end: "1992-08-23", curr: false },
    { personId: "james-baker", title: "67th United States Secretary of the Treasury", org: "US Department of the Treasury", start: "1985-02-04", end: "1988-08-17", curr: false },
    { personId: "boutros-boutros-ghali", title: "6th Secretary-General of the United Nations", org: "United Nations", start: "1992-01-01", end: "1996-12-31", curr: false },
    { personId: "boutros-boutros-ghali", title: "Minister of State for Foreign Affairs", org: "Government of Egypt", start: "1977-11-17", end: "1991-05-20", curr: false },
    { personId: "amr-moussa", title: "Minister of Foreign Affairs of Egypt", org: "Government of Egypt", start: "1991-05-20", end: "2001-05-15", curr: false },
    { personId: "amr-moussa", title: "Secretary-General of the Arab League", org: "Arab League", start: "2001-05-15", end: "2011-07-01", curr: false },
    { personId: "felipe-gonzalez", title: "Prime Minister of Spain (Presidente del Gobierno)", org: "Government of Spain", start: "1982-12-02", end: "1996-05-05", curr: false },
    { personId: "eduard-shevardnadze", title: "Minister of Foreign Affairs of the USSR", org: "Soviet Government", start: "1985-07-02", end: "1990-12-20", curr: false },
    { personId: "eduard-shevardnadze", title: "President of Georgia", org: "Government of Georgia", start: "1995-11-26", end: "2003-11-23", curr: false },
    { personId: "andrei-kozyrev", title: "1st Minister of Foreign Affairs of the Russian Federation", org: "Government of the Russian Federation", start: "1990-10-11", end: "1996-01-05", curr: false },
    { personId: "shlomo-ben-ami", title: "Minister of Foreign Affairs of Israel", org: "Government of Israel", start: "2000-08-10", end: "2001-03-07", curr: false },
    { personId: "saud-al-faisal", title: "Minister of Foreign Affairs of Saudi Arabia", org: "Kingdom of Saudi Arabia", start: "1975-10-13", end: "2015-04-29", curr: false },
    { personId: "crown-prince-abdullah-bin-abdulaziz", title: "King of Saudi Arabia", org: "Kingdom of Saudi Arabia", start: "2005-08-01", end: "2015-01-23", curr: false },
    { personId: "abdullah-bin-zayed-al-nahyan", title: "Minister of Foreign Affairs of the UAE", org: "United Arab Emirates", start: "2006-02-09", end: null, curr: true },
    { personId: "abdullatif-bin-rashid-al-zayani", title: "Minister of Foreign Affairs of Bahrain", org: "Kingdom of Bahrain", start: "2020-02-11", end: null, curr: true },
    { personId: "nasser-bourita", title: "Minister of Foreign Affairs of Morocco", org: "Kingdom of Morocco", start: "2017-04-05", end: null, curr: true },
    { personId: "mohammad-javad-zarif", title: "Minister of Foreign Affairs of Iran", org: "Islamic Republic of Iran", start: "2013-08-15", end: "2021-08-25", curr: false },
    { personId: "sergey-lavrov", title: "Minister of Foreign Affairs of the Russian Federation", org: "Government of the Russian Federation", start: "2004-03-09", end: null, curr: true },
    { personId: "wang-yi", title: "Minister of Foreign Affairs of the PRC", org: "State Council of the People's Republic of China", start: "2013-03-16", end: null, curr: true },
    { personId: "frank-walter-steinmeier", title: "President of the Federal Republic of Germany", org: "Federal Republic of Germany", start: "2017-03-19", end: null, curr: true },
    { personId: "laurent-fabius", title: "Minister of Foreign Affairs of France", org: "French Republic", start: "2012-05-16", end: "2016-02-11", curr: false },
    { personId: "philip-hammond", title: "Secretary of State for Foreign and Commonwealth Affairs", org: "HM Government", start: "2014-07-15", end: "2016-07-13", curr: false },
    { personId: "federica-mogherini", title: "High Representative of the European Union", org: "European Union", start: "2014-11-01", end: "2019-11-30", curr: false },
    { personId: "al-gore", title: "45th Vice President of the United States", org: "US Government", start: "1993-01-20", end: "2001-01-20", curr: false },
    { personId: "mike-pence", title: "48th Vice President of the United States", org: "US Government", start: "2017-01-20", end: "2021-01-20", curr: false },
    { personId: "john-boehner", title: "53rd Speaker of the US House of Representatives", org: "US House of Representatives", start: "2011-01-05", end: "2015-10-29", curr: false },
    { personId: "newt-gingrich", title: "50th Speaker of the US House of Representatives", org: "US House of Representatives", start: "1995-01-04", end: "1999-01-03", curr: false },
    { personId: "orrin-hatch", title: "President pro tempore of the US Senate", org: "United States Senate", start: "2015-01-06", end: "2019-01-03", curr: false },
    { personId: "mike-johnson", title: "56th Speaker of the US House of Representatives", org: "US House of Representatives", start: "2023-10-25", end: null, curr: true },
    { personId: "ben-cardin", title: "Chairman of the Senate Foreign Relations Committee", org: "United States Senate", start: "2023-09-27", end: "2025-01-03", curr: false },
    { personId: "rex-tillerson", title: "69th United States Secretary of State", org: "US Department of State", start: "2017-02-01", end: "2018-03-31", curr: false },
    { personId: "jeane-kirkpatrick", title: "16th US Permanent Representative to the United Nations", org: "United Nations", start: "1981-02-04", end: "1985-04-01", curr: false },
    { personId: "robert-h-jackson", title: "Chief US Prosecutor at the Nuremberg Trials", org: "International Military Tribunal", start: "1945-05-02", end: "1946-10-01", curr: false },
    { personId: "gideon-hausner", title: "Lead Prosecutor in the Trial of Adolf Eichmann", org: "State of Israel", start: "1960-07-01", end: "1962-05-31", curr: false },
    { personId: "moshe-landau", title: "Presiding Judge in the Trial of Adolf Eichmann", org: "Jerusalem District Court", start: "1961-04-11", end: "1961-12-15", curr: false },
    { personId: "shi-jiuyong", title: "President of the International Court of Justice", org: "International Court of Justice", start: "2003-02-06", end: "2006-02-05", curr: false },
    { personId: "rosalyn-higgins", title: "President of the International Court of Justice", org: "International Court of Justice", start: "2006-02-06", end: "2009-02-05", curr: false },
    { personId: "thomas-buergenthal", title: "Judge of the International Court of Justice", org: "International Court of Justice", start: "2000-03-02", end: "2010-09-06", curr: false },
    { personId: "nabil-elaraby", title: "Judge of the International Court of Justice", org: "International Court of Justice", start: "2001-10-12", end: "2006-02-05", curr: false },
    { personId: "reuven-rivlin", title: "10th President of the State of Israel", org: "State of Israel", start: "2014-07-24", end: "2021-07-07", curr: false },
    { personId: "sameh-shoukry", title: "Minister of Foreign Affairs of Egypt", org: "Government of Egypt", start: "2014-06-17", end: "2024-07-03", curr: false },
    { personId: "emile-lahoud", title: "11th President of the Republic of Lebanon", org: "Republic of Lebanon", start: "1998-11-24", end: "2007-11-23", curr: false },
    { personId: "yitzhak-halevi-herzog", title: "Ashkenazi Chief Rabbi of Israel", org: "Chief Rabbinate of Israel", start: "1936-01-01", end: "1959-07-25", curr: false },
  ];

  const rolesSql: string[] = [];
  for (const r of newRoles) {
    rolesSql.push(
      `INSERT INTO public.person_roles (person_id, title, start_date, end_date, is_current)
       SELECT COALESCE((SELECT id FROM public.people WHERE slug = ${escapeSql(r.personId)} OR id = ${escapeSql(r.personId)} LIMIT 1), ${escapeSql(r.personId)}), ${escapeSql(r.title)}, ${escapeSql(r.start)}, ${escapeSql(r.end)}, ${escapeSql(r.curr)}
       WHERE NOT EXISTS (
         SELECT 1 FROM public.person_roles
         WHERE person_id = COALESCE((SELECT id FROM public.people WHERE slug = ${escapeSql(r.personId)} OR id = ${escapeSql(r.personId)} LIMIT 1), ${escapeSql(r.personId)})
           AND title = ${escapeSql(r.title)}
       );`
    );
  }

  return {
    placesSql,
    addressesSql,
    venuesSql,
    venueAreasSql,
    eventsSql,
    peopleSql,
    rolesSql,
  };
}
