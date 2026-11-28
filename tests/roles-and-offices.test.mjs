/**
 * REWIND EVIDENCE ATLAS — FORENSIC VERIFICATION SUITE: ROLES & SUCCESSION
 *
 * Validates canonical prominent offices, succession lineages, scrollytelling contracts,
 * navigation integration, and WCAG AA accessibility compliance.
 */

import test, { after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));

const vite = await createServer({
  appType: "custom",
  configFile: false,
  root,
  resolve: { alias: { "@": root } },
  server: { middlewareMode: true },
});

after(async () => {
  if (vite) await vite.close();
});

test("Roles & Succession — Canonical Prominent Offices Register", async (t) => {
  const { prominentOfficesSeed } = await vite.ssrLoadModule("/data/seeds/prominent-offices.ts");

  await t.test("verifies all prominent offices exist and conform to schema", () => {
    assert.ok(prominentOfficesSeed.length >= 8, `Expected at least 8 prominent offices, got ${prominentOfficesSeed.length}`);

    const expectedOffices = [
      "president-of-the-united-states",
      "prime-minister-of-the-united-kingdom",
      "prime-minister-of-israel",
      "secretary-general-of-the-united-nations",
      "united-states-secretary-of-state",
      "chancellor-of-germany",
      "president-of-france",
      "monarch-of-the-united-kingdom",
      "pope-bishop-of-rome",
    ];

    for (const officeId of expectedOffices) {
      const office = prominentOfficesSeed.find((o) => o.id === officeId);
      assert.ok(office, `Prominent office missing: ${officeId}`);
      assert.ok(office.title && office.title.length > 5, `Office ${officeId} has invalid title`);
      assert.ok(office.jurisdiction && office.jurisdiction.length > 3, `Office ${officeId} has invalid jurisdiction`);
      assert.ok(office.flag && office.flag.length > 0, `Office ${officeId} missing flag`);
      assert.ok(office.residence && office.residence.length > 3, `Office ${officeId} missing residence`);
      assert.ok(office.description && office.description.length > 20, `Office ${officeId} missing description`);
      assert.ok(Array.isArray(office.holders) && office.holders.length > 0, `Office ${officeId} has zero holders`);
    }
  });

  await t.test("verifies officeholder tenures, chronological ordering, and ISO dates", () => {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

    for (const office of prominentOfficesSeed) {
      assert.ok(office.holders.length > 0, `${office.id} must have holders`);

      let prevStartDate = "";
      for (const holder of office.holders) {
        assert.ok(holder.name && holder.name.length > 2, `Holder missing name in ${office.id}`);
        assert.ok(holder.ordinal > 0, `Holder ${holder.name} invalid ordinal`);
        assert.ok(holder.ordinalLabel, `Holder ${holder.name} missing ordinalLabel`);
        assert.match(holder.startDate, isoDateRegex, `Holder ${holder.name} startDate must be ISO-8601`);

        if (holder.endDate) {
          assert.match(holder.endDate, isoDateRegex, `Holder ${holder.name} endDate must be ISO-8601`);
          assert.ok(
            holder.startDate <= holder.endDate,
            `Holder ${holder.name} startDate (${holder.startDate}) must precede or equal endDate (${holder.endDate})`
          );
        } else {
          assert.ok(holder.isCurrent, `Holder ${holder.name} with null endDate must be isCurrent: true`);
        }

        assert.ok(holder.era && holder.era.length > 2, `Holder ${holder.name} missing era`);
        assert.ok(holder.summary && holder.summary.length > 20, `Holder ${holder.name} missing summary`);

        // Check non-decreasing start dates
        assert.ok(
          holder.startDate >= prevStartDate,
          `Holders in ${office.id} must be ordered chronologically: ${holder.name} (${holder.startDate}) vs prev (${prevStartDate})`
        );
        prevStartDate = holder.startDate;
      }
    }
  });

  await t.test("verifies current incumbents across sovereign and multilateral offices", () => {
    const currentUSPresident = prominentOfficesSeed
      .find((o) => o.id === "president-of-the-united-states")
      ?.holders.find((h) => h.isCurrent);
    assert.ok(currentUSPresident, "US Presidency must have a current incumbent");
    assert.equal(currentUSPresident.name, "Donald Trump");
    assert.equal(currentUSPresident.ordinal, 47);

    const currentUKPM = prominentOfficesSeed
      .find((o) => o.id === "prime-minister-of-the-united-kingdom")
      ?.holders.find((h) => h.isCurrent);
    assert.ok(currentUKPM, "UK Prime Minister must have a current incumbent");
    assert.equal(currentUKPM.name, "Sir Keir Starmer");
    assert.equal(currentUKPM.ordinal, 58);
    assert.equal(currentUKPM.ordinalLabel, "58th Prime Minister");

    const unSecGenOffice = prominentOfficesSeed.find((o) => o.id === "secretary-general-of-the-united-nations");
    const unHoldersWithoutDossier = unSecGenOffice?.holders.filter((h) =>
      ["Trygve Lie", "U Thant", "Kurt Waldheim"].includes(h.name)
    );
    assert.ok(unHoldersWithoutDossier && unHoldersWithoutDossier.length === 3);
    for (const h of unHoldersWithoutDossier) {
      assert.equal(h.personSlug, null, `Holder ${h.name} without dossier seed must have personSlug: null`);
    }

    const currentUNSecGen = prominentOfficesSeed
      .find((o) => o.id === "secretary-general-of-the-united-nations")
      ?.holders.find((h) => h.isCurrent);
    assert.ok(currentUNSecGen, "UN Secretary-General must have a current incumbent");
    assert.equal(currentUNSecGen.name, "António Guterres");

    const currentMonarch = prominentOfficesSeed
      .find((o) => o.id === "monarch-of-the-united-kingdom")
      ?.holders.find((h) => h.isCurrent);
    assert.ok(currentMonarch, "British Monarchy must have a current incumbent");
    assert.equal(currentMonarch.name, "King Charles III");
  });
});

test("Roles & Succession — Domain Engine & Query Methods", async (t) => {
  const {
    getProminentOffices,
    getProminentOfficeBySlug,
    getOfficeHolders,
  } = await vite.ssrLoadModule("/lib/rewind/offices.ts");

  await t.test("getProminentOffices returns all offices", async () => {
    const offices = await getProminentOffices();
    assert.ok(offices.length >= 8);
  });

  await t.test("getProminentOfficeBySlug returns specific office or null", async () => {
    const usPres = await getProminentOfficeBySlug("president-of-the-united-states");
    assert.ok(usPres);
    assert.equal(usPres.shortTitle, "US President");

    const missing = await getProminentOfficeBySlug("non-existent-office-slug");
    assert.equal(missing, null);
  });

  await t.test("getOfficeHolders returns sorted officeholder array", async () => {
    const holders = await getOfficeHolders("prime-minister-of-israel");
    assert.ok(holders.length > 5);
    assert.equal(holders[0].name, "David Ben-Gurion");
    assert.equal(holders[0].startDate, "1948-05-14");
  });
});

test("Roles & Succession — Navigation and Viewport Integration", async (t) => {
  await t.test("Shell.tsx includes Roles navigation link in primary nav", () => {
    const shellContent = fs.readFileSync(path.join(process.cwd(), "components/rewind/Shell.tsx"), "utf8");
    assert.match(shellContent, /label:\s*"Roles"/, "Shell.tsx must define Roles in baseNav");
    assert.match(shellContent, /href:\s*"\/roles"/, "Shell.tsx must point Roles to /roles");
  });

  await t.test("Home page launchpad features Roles card", () => {
    const homeContent = fs.readFileSync(path.join(process.cwd(), "app/page.tsx"), "utf8");
    assert.match(homeContent, /href="\/roles"/, "Home page must link to /roles in launchpad");
    assert.match(homeContent, /<b>Roles<\/b>/, "Home page must render Roles launch card title");
  });

  await t.test("Person roles timeline includes cross-link to /roles", () => {
    const timelineContent = fs.readFileSync(
      path.join(process.cwd(), "components/rewind/RolesTimeline.tsx"),
      "utf8"
    );
    assert.match(timelineContent, /href="\/roles"/, "RolesTimeline must cross-link to /roles");
  });

  await t.test("globals.css defines roles scrollytelling styles and complies with WCAG AA", () => {
    const cssContent = fs.readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8");
    assert.match(cssContent, /\.roles-hub-root/, "globals.css must define .roles-hub-root");
    assert.match(cssContent, /\.roles-scrollytelling-layout/, "globals.css must define .roles-scrollytelling-layout");
    assert.match(cssContent, /\.roles-scrolly-card/, "globals.css must define .roles-scrolly-card");
    assert.match(cssContent, /\.roles-scrolly-hud/, "globals.css must define .roles-scrolly-hud");

    assert.match(cssContent, /\.roles-overview-stats\s*\{[^}]*flex-wrap:\s*wrap;/, ".roles-overview-stats must allow wrapping on narrow viewports");
    assert.match(cssContent, /\.roles-search-wrapper\s*\{[^}]*min-width:\s*min\(260px,\s*100%\);/, ".roles-search-wrapper must cap min-width at 100%");
    assert.doesNotMatch(cssContent, /\.roles-badge-active-pulse\s*\{[^}]*animation:\s*pulse/, ".roles-badge-active-pulse must not use opacity pulse animation on text badge");

    // Strict contrast check
    assert.doesNotMatch(
      cssContent,
      /#64748b/i,
      "globals.css must contain zero occurrences of low-contrast #64748b token"
    );
  });
});

test("PR 44 Code Review Fixes — Database Scripts, Person Dossier Fallback & Venue Areas", async (t) => {
  const { getPersonBySlugWithStatus } = await vite.ssrLoadModule("/lib/rewind/people.ts");
  const { generateAllEnrichmentSql } = await vite.ssrLoadModule("/scripts/generate-enrichment-sql.ts");

  await t.test("getPersonBySlugWithStatus suppresses withdrawn database records without seed fallback", async () => {
    const mockSupabase = {
      from: () => ({
        select: () => ({
          or: () => ({
            maybeSingle: async () => ({
              data: {
                id: "person-withdrawn",
                slug: "benjamin-netanyahu",
                publication_status: "withdrawn",
              },
              error: null,
            }),
          }),
        }),
      }),
    };

    const res = await getPersonBySlugWithStatus("benjamin-netanyahu", mockSupabase);
    assert.equal(res.data, null, "Withdrawn database row must return null data and suppress dossier");
    assert.equal(res.error, null, "Suppression must not return database error");
  });

  await t.test("getPersonBySlugWithStatus preserves publication restrictions and returns canonical miss for absent or unpublished records", async () => {
    const mockSupabase = {
      from: () => ({
        select: () => ({
          or: () => ({
            maybeSingle: async () => ({
              data: null,
              error: null,
            }),
          }),
        }),
      }),
    };

    const res = await getPersonBySlugWithStatus("benjamin-netanyahu", mockSupabase);
    assert.equal(res.data, null, "Public query with no matching published DB row must return canonical miss to preserve RLS publication restrictions");
    assert.equal(res.error, null);
  });

  await t.test("getPersonBySlugWithStatus falls back to seed when Supabase client is unavailable in dev/test", async () => {
    const res = await getPersonBySlugWithStatus("benjamin-netanyahu", null);
    assert.ok(res.data, "Unavailable DB client in dev/test must safely fall back to seed");
    assert.equal(res.data.slug, "benjamin-netanyahu");
  });

  await t.test("purge-delegation-placeholders script strictly enforces AGENTS.md Permanent Addition & Non-Deletion Rule", () => {
    const scriptPath = path.join(process.cwd(), "scripts/purge-delegation-placeholders.mjs");
    const scriptCode = fs.readFileSync(scriptPath, "utf8");
    assert.ok(!scriptCode.includes(".delete()"), "Script must never call .delete() per AGENTS.md Permanent Addition & Non-Deletion Rule");
    assert.ok(scriptCode.includes('publication_status: "archived"'), "Script must archive records in place");
    assert.ok(scriptCode.includes("Archival Provenance Audit"), "Script must record archival provenance audit notes");
    assert.ok(scriptCode.includes('typeof qRes.count !== "number"'), "Script must validate evidence counts");
    assert.ok(scriptCode.includes("archive_delegation_placeholder"), "Script must invoke atomic body-based RPC to compare summary and update");
    assert.ok(!scriptCode.includes('query.eq("summary"'), "Script must not place unbounded summary into URL-encoded filter");
    assert.ok(scriptCode.includes('query.is("primary_role", null)'), "Script must handle null condition on primary_role predicate");
    assert.ok(scriptCode.includes('query.is("updated_at", null)'), "Script must handle bounded revision token on update");
    assert.ok(scriptCode.includes("missingIds.length > 0"), "Script must reject verification if expected IDs are missing");

    const migrationPath = path.join(process.cwd(), "supabase/migrations/20260904120000_archive_delegation_placeholder_rpc.sql");
    const migrationSql = fs.readFileSync(migrationPath, "utf8");
    assert.ok(
      migrationSql.includes("REVOKE EXECUTE ON FUNCTION public.archive_delegation_placeholder") &&
      migrationSql.includes("FROM PUBLIC, anon, authenticated;"),
      "Migration must revoke EXECUTE from PUBLIC, anon, and authenticated on SECURITY DEFINER RPC"
    );
    assert.ok(
      migrationSql.includes("GRANT EXECUTE ON FUNCTION public.archive_delegation_placeholder") &&
      migrationSql.includes("TO service_role;"),
      "Migration must grant EXECUTE exclusively to service_role"
    );
  });

  await t.test("generateAllEnrichmentSql advances updated_at across all people update and upsert statements", () => {
    const sqls = generateAllEnrichmentSql();
    const peopleStatements = sqls.peopleSql;
    assert.ok(peopleStatements.length > 0, "Expected people SQL statements");
    for (const stmt of peopleStatements) {
      if (stmt.includes("DO UPDATE SET")) {
        const updateClause = stmt.split("DO UPDATE SET")[1];
        assert.ok(updateClause.includes("updated_at"), "Every people upsert statement must advance updated_at in its DO UPDATE SET clause");
      } else {
        const match = stmt.match(/\bSET\b([\s\S]+?)\bWHERE\b/i);
        assert.ok(match && match[1].includes("updated_at"), "Every plain people update statement must advance updated_at in its SET list");
      }
    }
  });

  await t.test("generateAllEnrichmentSql preserves existing room coordinates as pairs and home base IDs", () => {
    const sqls = generateAllEnrichmentSql();
    const venueAreaStatements = sqls.venueAreasSql;
    assert.ok(venueAreaStatements.length > 0, "Expected venue area statements");

    // Room position preservation check (pair-wise coordinate preservation)
    const sampleArea = venueAreaStatements.find((s) => s.includes("public.venue_areas.latitude IS NOT NULL AND public.venue_areas.longitude IS NOT NULL"));
    assert.ok(sampleArea, "Venue areas upsert must preserve existing room positions as complete pairs");

    // Home base place preservation check
    const sampleVenue = sqls.venuesSql.find((s) => s.includes("COALESCE(EXCLUDED.home_base_place_id, public.venues.home_base_place_id)"));
    assert.ok(sampleVenue, "Venues upsert must preserve existing home base places using COALESCE");
  });

  await t.test("PlacesExplorer VenueTargetButton specifies accessible focus outline and offset", () => {
    const placesExplorerCode = fs.readFileSync(path.join(process.cwd(), "components/rewind/PlacesExplorer.tsx"), "utf8");
    assert.match(placesExplorerCode, /focus-visible:outline-\[#38bdf8\]/, "VenueTargetButton must use focus-visible:outline-[#38bdf8] per the focus-visible standard");
    assert.match(placesExplorerCode, /focus-visible:outline-offset-2/, "VenueTargetButton must use focus-visible:outline-offset-2");
    assert.match(placesExplorerCode, /bg-sky-700\s+text-white\s+border-sky-700/, "VenueTargetButton selected state must use bg-sky-700 for >= 4.5:1 contrast against white text");
  });

  await t.test("formatStandardPersonName maps King and Queen in comma-form royal names", async () => {
    const { formatStandardPersonName } = await vite.ssrLoadModule("/lib/rewind/utils.ts");
    assert.equal(
      formatStandardPersonName({ displayName: "Louis XIV, King of France", classification: "monarch-royal" }),
      "King Louis XIV"
    );
    assert.equal(
      formatStandardPersonName({ displayName: "Elizabeth II, Queen of the United Kingdom", classification: "monarch-royal" }),
      "Queen Elizabeth II"
    );
  });

  await t.test("event page surfaces and foregrounds comply with Forensic Obsidian high-contrast standards", () => {
    const globalsCss = fs.readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8");
    assert.match(globalsCss, /\.event-page\s*\{[^}]*background:\s*var\(--bg-primary,\s*#050811\);[^}]*color:\s*#f8fafc;/, "event-page must use dark Obsidian background and #f8fafc text");
    assert.match(globalsCss, /\.participant-list a\s*\{[^}]*color:\s*#f8fafc;/, "participant-list a must set #f8fafc foreground on dark surface");
    assert.match(globalsCss, /\.evidence-rail article\s*\{[^}]*color:\s*#f8fafc;/, "evidence-rail article must set #f8fafc foreground on dark surface");
    assert.match(globalsCss, /\.event-pager > a\s*\{[^}]*color:\s*#f8fafc;/, "event-pager a must set #f8fafc foreground on dark surface");
    assert.match(globalsCss, /\.event-summary\s*\{[^}]*color:\s*#cbd5e1;/, "event-summary must use high-contrast #cbd5e1 on dark canvas");
  });
});
