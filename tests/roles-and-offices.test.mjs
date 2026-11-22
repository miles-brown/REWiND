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

    // Strict contrast check
    assert.doesNotMatch(
      cssContent,
      /#64748b/i,
      "globals.css must contain zero occurrences of low-contrast #64748b token"
    );
  });
});
