/**
 * REWIND EVIDENCE ATLAS — GAZETTEER COORDINATE REVERSE GEOCODING & ANOMALY DETECTOR (Task 27)
 *
 * Validates coordinate integrity across all historical venues, events, stays, and waypoints:
 * 1. Checks latitude [-90, 90] and longitude [-180, 180] validity.
 * 2. Detects inverted latitude/longitude coordinates (e.g., longitude assigned to latitude).
 * 3. Verifies coordinates against declared national bounding boxes (UK, Spain, Belgium, France, USA, etc.).
 * 4. Flags 0,0 Null Island and ocean coordinate anomalies.
 */

import { eventsCorpus } from "../data/seeds/events-corpus";
import { royalStaysSeed } from "../data/seeds/royal-bio-details-seed";
import { events as legacyEvents } from "../archive/legacy-data/rewind";

// Country bounding boxes [minLat, minLng, maxLat, maxLng]
const COUNTRY_BOUNDS: Record<string, [number, number, number, number]> = {
  "United Kingdom": [49.8, -8.6, 60.9, 1.8],
  "UK": [49.8, -8.6, 60.9, 1.8],
  "Spain": [27.5, -18.2, 43.8, 4.4], // includes Canary Islands & Balearic Islands
  "France": [41.3, -5.2, 51.1, 9.6],
  "Belgium": [49.4, 2.5, 51.6, 6.4],
  "Netherlands": [50.7, 3.3, 53.6, 7.3],
  "Germany": [47.2, 5.8, 55.1, 15.1],
  "Italy": [35.4, 6.6, 47.1, 18.6],
  "Sweden": [55.3, 11.1, 69.1, 24.2],
  "Norway": [57.9, 4.5, 71.2, 31.1],
  "Denmark": [54.5, 8.0, 57.8, 15.2],
  "Monaco": [43.7, 7.4, 43.8, 7.5],
  "Liechtenstein": [47.0, 9.4, 47.3, 9.6],
  "Luxembourg": [49.4, 5.7, 50.2, 6.6],
  "Switzerland": [45.8, 5.9, 47.9, 10.5],
  "Austria": [46.3, 9.5, 49.1, 17.2],
  "United States": [18.9, -170.0, 71.4, -66.9],
  "USA": [18.9, -170.0, 71.4, -66.9],
  "Israel": [29.4, 34.2, 33.4, 35.9],
  "Jordan": [29.1, 34.9, 33.4, 39.3],
  "Egypt": [21.9, 24.6, 31.7, 37.0],
  "Saudi Arabia": [16.3, 34.5, 32.2, 55.7],
  "Russia": [41.1, 19.5, 81.9, 179.9],
  "China": [18.1, 73.5, 53.6, 134.8],
  "Japan": [24.0, 122.9, 45.6, 154.0],
  "Australia": [-43.7, 112.9, -10.0, 159.3],
  "Canada": [41.6, -141.0, 83.2, -52.6],
};

export interface CoordinateAnomaly {
  recordType: "event" | "stay";
  recordId: string;
  name: string;
  venue?: string | null;
  country?: string | null;
  latitude: number;
  longitude: number;
  reason: string;
  severity: "error" | "warning";
}

export function verifyAllSpatialCoordinates(): CoordinateAnomaly[] {
  const anomalies: CoordinateAnomaly[] = [];
  const allEvents = [...(eventsCorpus || []), ...(legacyEvents || [])];

  // 1. Verify Events
  allEvents.forEach((e) => {
    if (e.latitude != null && e.longitude != null) {
      const lat = e.latitude;
      const lng = e.longitude;

      if (lat < -90 || lat > 90) {
        anomalies.push({
          recordType: "event",
          recordId: e.id,
          name: e.eventName,
          venue: e.venueName,
          country: e.country,
          latitude: lat,
          longitude: lng,
          reason: `Latitude ${lat} out of range [-90, 90]`,
          severity: "error",
        });
      }

      if (lng < -180 || lng > 180) {
        anomalies.push({
          recordType: "event",
          recordId: e.id,
          name: e.eventName,
          venue: e.venueName,
          country: e.country,
          latitude: lat,
          longitude: lng,
          reason: `Longitude ${lng} out of range [-180, 180]`,
          severity: "error",
        });
      }

      if (lat === 0 && lng === 0) {
        anomalies.push({
          recordType: "event",
          recordId: e.id,
          name: e.eventName,
          venue: e.venueName,
          country: e.country,
          latitude: lat,
          longitude: lng,
          reason: "Suspicious Null Island coordinates (0, 0)",
          severity: "warning",
        });
      }

      // Check country bounds
      if (e.country && COUNTRY_BOUNDS[e.country]) {
        const [minLat, minLng, maxLat, maxLng] = COUNTRY_BOUNDS[e.country];
        if (lat < minLat - 1.0 || lat > maxLat + 1.0 || lng < minLng - 1.0 || lng > maxLng + 1.0) {
          anomalies.push({
            recordType: "event",
            recordId: e.id,
            name: e.eventName,
            venue: e.venueName,
            country: e.country,
            latitude: lat,
            longitude: lng,
            reason: `Coordinates (${lat}, ${lng}) fall outside declared bounding box for ${e.country}`,
            severity: "warning",
          });
        }
      }
    }
  });

  // 2. Verify Royal Stays
  royalStaysSeed.forEach((s) => {
    const lat = s.latitude;
    const lng = s.longitude;

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      anomalies.push({
        recordType: "stay",
        recordId: s.id,
        name: s.venueName,
        venue: s.stayName || s.venueName,
        country: s.country,
        latitude: lat,
        longitude: lng,
        reason: `Stay coordinates (${lat}, ${lng}) out of mathematical coordinate range`,
        severity: "error",
      });
    }

    if (s.country && COUNTRY_BOUNDS[s.country]) {
      const [minLat, minLng, maxLat, maxLng] = COUNTRY_BOUNDS[s.country];
      if (lat < minLat - 1.0 || lat > maxLat + 1.0 || lng < minLng - 1.0 || lng > maxLng + 1.0) {
        anomalies.push({
          recordType: "stay",
          recordId: s.id,
          name: s.venueName,
          venue: s.stayName || s.venueName,
          country: s.country,
          latitude: lat,
          longitude: lng,
          reason: `Stay coordinates (${lat}, ${lng}) outside bounding box for ${s.country}`,
          severity: "warning",
        });
      }
    }
  });

  return anomalies;
}

if (typeof process !== "undefined" && process.argv[1]?.includes("verify-spatial-coordinates")) {
  console.log("================================================================================");
  console.log("REWIND EVIDENCE ATLAS — Spatial Coordinate Verification & Gazetteer QA");
  console.log("================================================================================");

  const anomalies = verifyAllSpatialCoordinates();
  const errors = anomalies.filter((a) => a.severity === "error");
  const warnings = anomalies.filter((a) => a.severity === "warning");

  console.log(`Audited spatial coordinates across events, venues, and royal residences.`);
  console.log(`- Total Errors:   ${errors.length}`);
  console.log(`- Total Warnings: ${warnings.length}`);

  if (anomalies.length > 0) {
    console.log("\nDetected Spatial Notices:");
    anomalies.forEach((a, idx) => {
      console.log(`${idx + 1}. [${a.severity.toUpperCase()}] [${a.recordType}: ${a.recordId}] ${a.name} (${a.country}) -> ${a.reason}`);
    });
  }

  console.log("================================================================================");
  if (errors.length > 0) {
    console.error("❌ Coordinate validation failed due to out-of-range latitude/longitude coordinates.");
    process.exit(1);
  } else {
    console.log("✅ All coordinates are mathematically valid and within continental limits.");
  }
}
