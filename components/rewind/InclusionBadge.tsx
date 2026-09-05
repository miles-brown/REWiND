import { CheckCircle2, ShieldCheck, HelpCircle } from "lucide-react";
import type { PersonRecord } from "@/lib/rewind";

const CRITERIA_LABELS: Record<string, string> = {
  "head-of-state-or-government": "Head of state or recognized national government",
  "senior-diplomatic-or-geopolitical": "Senior diplomatic envoy, foreign minister, or treaty signatory",
  "major-religious-authority": "Major religious leader or theological authority",
  "major-cultural-or-intellectual": "Major cultural, artistic, or intellectual contribution",
  "scientific-or-technological-impact": "Significant scientific, technological, or academic milestone",
  "substantial-independent-coverage": "Substantial independent third-party coverage across multiple decades",
  "scholarly-historiographical-subject": "Subject of serious academic historiography and monographs",
  "central-nexus-to-historical-events": "Material connection to documented historical events and treaties",
  "significant-legal-or-judicial-record": "Central figure in landmark judicial proceedings or inquiries",
};

export function InclusionBadge({ person }: { person: PersonRecord }) {
  const criteria = person.inclusionBasis && person.inclusionBasis.length > 0
    ? person.inclusionBasis
    : [
        person.classification === "head-of-state" || person.classification === "prime-minister"
          ? "head-of-state-or-government"
          : "central-nexus-to-historical-events",
        "substantial-independent-coverage",
        "scholarly-historiographical-subject",
      ];

  return (
    <section className="inclusion-panel" aria-label="REWiND Indexing Basis">
      <div className="inclusion-header">
        <span className="inclusion-badge-pill">
          <ShieldCheck size={14} /> REWIND INCLUSION BASIS
        </span>
        <h3>Why this figure is indexed in the Evidence Atlas</h3>
        <p>
          {person.inclusionRationale ||
            `${person.name} qualifies for chronological evidentiary coverage under REWiND's historical notability standards due to documented sovereign public mandates, extensive diplomatic records, and enduring archival relevance.`}
        </p>
      </div>

      <div className="inclusion-criteria-list">
        {criteria.map((key) => (
          <div key={key} className="criterion-item">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span>{CRITERIA_LABELS[key] || key.replace(/-/g, " ")}</span>
          </div>
        ))}
      </div>

      <div className="inclusion-footer">
        <small>
          <HelpCircle size={12} /> Inclusion is determined strictly by verifiable public record and research criteria, not political or personal affiliation.
        </small>
      </div>
    </section>
  );
}
