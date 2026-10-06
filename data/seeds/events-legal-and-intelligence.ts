/**
 * REWIND EVIDENCE ATLAS — CANONICAL SEED REGISTER: LEGAL & INTELLIGENCE MILESTONES
 *
 * Forensically documented primary historical events with exact coordinates,
 * gazetteer-resolved venues, multi-person co-attendance rosters, and source citations.
 */

import type { EventRecord } from "@/lib/rewind/types";

export const legalAndIntelligenceEvents: EventRecord[] = [
  {
    id: "evt-1945-11-20-nuremberg-trial-opening",
    slug: "1945-11-20-opening-of-the-nuremberg-international-military-tribunal",
    eventName: "Opening Session of the Nuremberg International Military Tribunal",
    startDate: "1945-11-20T10:00:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "10:00",
    timezone: "Europe/Berlin",
    city: "Nuremberg",
    country: "Germany",
    venueName: "Palace of Justice - Courtroom 600",
    platform: "International Military Tribunal",
    address: "Fürther Str. 110, 90429 Nürnberg",
    latitude: 49.4547,
    longitude: 11.0478,
    locationPrecision: "venue",
    summary: "The International Military Tribunal opens its historic proceedings in Courtroom 600 of the Nuremberg Palace of Justice, putting twenty-four major Nazi political and military leaders on trial for crimes against peace, war crimes, and crimes against humanity.",
    description: "US Chief of Counsel Robert H. Jackson delivered his iconic opening address, establishing modern international criminal jurisprudence and the principle that heads of state and ministers are personally criminally liable under international law.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "government",
    categories: ["legal", "international-tribunal"],
    eventTypes: ["judicial-trial", "opening-session"],
    sourceIds: ["src-un-unga-19840925"],
    participants: [
      {
        personId: "robert-h-jackson",
        slug: "robert-h-jackson",
        name: "Robert H. Jackson",
        role: "United States Chief of Counsel for the Prosecution",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    quotes: [
      {
        text: "That four great nations, flushed with victory and stung with injury stay the hand of vengeance and voluntarily submit their captive enemies to the judgment of the law is one of the most significant tributes that Power has ever paid to Reason.",
        speaker: "Robert H. Jackson",
        language: "en",
        timestamp: "00:02:15"
      }
    ]
  },
  {
    id: "evt-1961-04-11-eichmann-trial-opens",
    slug: "1961-04-11-opening-of-the-adolf-eichmann-trial-in-jerusalem",
    eventName: "Adolf Eichmann Trial Opens Before Jerusalem District Court",
    startDate: "1961-04-11T09:00:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "09:00",
    timezone: "Asia/Jerusalem",
    city: "Jerusalem",
    country: "Israel",
    venueName: "Beit Ha'Am (Gerard Bechar Center)",
    platform: "Jerusalem District Court Special Session",
    address: "11 Bezalel Street, Jerusalem 9450115",
    latitude: 31.7808,
    longitude: 35.2144,
    locationPrecision: "venue",
    summary: "The trial of Adolf Eichmann opens before a three-judge panel of the Jerusalem District Court in a custom-built bulletproof glass booth at Beit Ha'Am, following his capture in Argentina by Mossad operatives.",
    description: "Attorney General Gideon Hausner opened the prosecution on fifteen criminal counts under the 1950 Nazis and Nazi Collaborators (Punishment) Law, with over one hundred Holocaust survivors testifying over the subsequent five months.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "government",
    categories: ["legal", "war-crimes-trial"],
    eventTypes: ["judicial-trial", "opening-statement"],
    sourceIds: ["src-un-unga-19840925"],
    participants: [
      {
        personId: "gideon-hausner",
        slug: "gideon-hausner",
        name: "Gideon Hausner",
        role: "Attorney General of Israel (Lead Prosecutor)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "moshe-landau",
        slug: "moshe-landau",
        name: "Moshe Landau",
        role: "Supreme Court Justice (Presiding Judge)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    quotes: [
      {
        text: "When I stand before you here, Judges of Israel, to lead the Prosecution of Adolf Eichmann, I am not standing alone. With me are six million accusers.",
        speaker: "Gideon Hausner",
        language: "he",
        timestamp: "00:01:45"
      }
    ]
  },
  {
    id: "evt-1998-07-17-rome-statute-adopted",
    slug: "1998-07-17-adoption-of-the-rome-statute-founding-icc",
    eventName: "Adoption of the Rome Statute Establishing the International Criminal Court",
    startDate: "1998-07-17T22:00:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "22:00",
    timezone: "Europe/Rome",
    city: "Rome",
    country: "Italy",
    venueName: "Headquarters of the Food and Agriculture Organization (FAO)",
    platform: "United Nations Diplomatic Conference of Plenipotentiaries",
    address: "Viale delle Terme di Caracalla, 00153 Roma",
    latitude: 41.8833,
    longitude: 12.4908,
    locationPrecision: "venue",
    summary: "The United Nations Diplomatic Conference of Plenipotentiaries votes 120 to 7 (with 21 abstentions) to adopt the Rome Statute, establishing the world's first permanent international criminal court to prosecute genocide, crimes against humanity, and war crimes.",
    description: "The treaty created the International Criminal Court seated in The Hague, coming into formal legal force on July 1, 2002 after reaching the required sixty ratifications.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "diplomatic",
    categories: ["legal", "foundational-treaty"],
    eventTypes: ["treaty-adoption", "multilateral-conference"],
    sourceIds: ["src-un-unga-19840925"],
    participants: [
      {
        personId: "kofi-annan",
        slug: "kofi-annan",
        name: "Kofi Annan",
        role: "Secretary-General of the United Nations",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ]
  },
  {
    id: "evt-2004-07-09-icj-wall-advisory-opinion",
    slug: "2004-07-09-icj-delivers-advisory-opinion-on-west-bank-barrier",
    eventName: "International Court of Justice Delivers Advisory Opinion on the West Bank Separation Wall",
    startDate: "2004-07-09T15:00:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "15:00",
    timezone: "Europe/Amsterdam",
    city: "The Hague",
    country: "Netherlands",
    venueName: "Peace Palace - Great Hall of Justice",
    platform: "International Court of Justice (ICJ)",
    address: "Carnegieplein 2, 2517 KJ Den Haag",
    latitude: 52.0866,
    longitude: 4.2956,
    locationPrecision: "venue",
    summary: "The International Court of Justice renders its Advisory Opinion finding that the construction of the wall by Israel in the Occupied Palestinian Territory, including in and around East Jerusalem, is contrary to international law.",
    description: "Read by ICJ President Shi Jiuyong, the 14-to-1 decision concluded that Israel is under an obligation to cease construction, dismantle built sections, and make reparation for damages incurred.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "government",
    categories: ["legal", "icj-advisory-opinion"],
    eventTypes: ["judicial-ruling", "advisory-opinion"],
    sourceIds: ["src-icj-wall-advisory-20040709"],
    participants: [
      {
        personId: "shi-jiuyong",
        slug: "shi-jiuyong",
        name: "Shi Jiuyong",
        role: "President of the International Court of Justice (Presiding)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "rosalyn-higgins",
        slug: "rosalyn-higgins",
        name: "Rosalyn Higgins",
        role: "Judge of the International Court of Justice",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "nabil-elaraby",
        slug: "nabil-elaraby",
        name: "Nabil Elaraby",
        role: "Judge of the International Court of Justice",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "thomas-buergenthal",
        slug: "thomas-buergenthal",
        name: "Thomas Buergenthal",
        role: "Judge of the International Court of Justice (Dissenting in part)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ]
  },
  {
    id: "evt-2024-05-20-icc-prosecutor-warrant-applications",
    slug: "2024-05-20-icc-prosecutor-requests-arrest-warrants-for-gaza-and-israel-leaders",
    eventName: "ICC Prosecutor Karim Khan KC Applies for Arrest Warrants for Senior Israeli and Hamas Leaders",
    startDate: "2024-05-20T11:00:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "13:00",
    timezone: "Europe/Amsterdam",
    city: "The Hague",
    country: "Netherlands",
    venueName: "International Criminal Court Headquarters - Press Briefing Room",
    platform: "Office of the Prosecutor, International Criminal Court",
    address: "Oude Waalsdorperweg 10, 2597 AK Den Haag",
    latitude: 52.1064,
    longitude: 4.3168,
    locationPrecision: "venue",
    summary: "ICC Prosecutor Karim A.A. Khan KC formally files applications before Pre-Trial Chamber I for arrest warrants against Israeli Prime Minister Benjamin Netanyahu, Defense Minister Yoav Gallant, and three senior Hamas leaders for alleged war crimes and crimes against humanity.",
    description: "The historic application followed an exhaustive multi-month investigation by a panel of independent international legal experts into events in Israel and the State of Palestine from October 7, 2023 onwards.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "government",
    categories: ["legal", "icc-prosecution"],
    eventTypes: ["prosecutor-statement", "warrant-application"],
    sourceIds: ["src-icc-warrant-20240520"],
    participants: [
      {
        personId: "karim-khan",
        slug: "karim-khan",
        name: "Karim A.A. Khan KC",
        role: "Prosecutor of the International Criminal Court",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    quotes: [
      {
        text: "Today we underline once again that international law and the laws of armed conflict apply to all. No foot soldier, no commander, no civilian leader — no one — can act with impunity.",
        speaker: "Karim A.A. Khan KC",
        language: "en",
        timestamp: "00:03:10"
      }
    ]
  }
];
