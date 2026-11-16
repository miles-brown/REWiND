import Link from "next/link";
import { CheckCircle2, ShieldCheck, HelpCircle, ArrowRight } from "lucide-react";
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
    : [];

  return (
    <section className="inclusion-panel" aria-label="REWiND Indexing Basis">
      <div className="inclusion-header">
        <div className="inclusion-title-group">
          <span className="inclusion-badge-pill" aria-hidden="true">
            <ShieldCheck size={18} />
          </span>
          <div>
            <span className="eyebrow">INDEXING & VERIFICATION STANDARD</span>
            <h3>Historical Inclusion Basis</h3>
            <span className="inclusion-meta">
              Objective criteria and primary-source rationale for indexing {person.name} in the REWiND Evidence Atlas
            </span>
          </div>
        </div>
      </div>

      <div className="inclusion-content-grid">
        <div className="inclusion-rationale-block">
          <h4 className="inclusion-block-label">Documented Qualification Rationale</h4>
          <div className="qualification-rationale">
            <p style={{ margin: 0 }}>
              {person.inclusionRationale ||
                person.notabilityBasis ||
                "Formal inclusion rationale under REWiND historical indexing standards has not yet been documented for this profile."}
            </p>
          </div>
        </div>

        <div className="inclusion-criteria-block">
          <h4 className="inclusion-block-label">
            Qualifying Criteria ({criteria.length})
          </h4>
          {criteria.length > 0 ? (
            <div className="inclusion-criteria-list">
              {criteria.map((key) => (
                <div key={key} className="criterion-item">
                  <CheckCircle2 size={15} aria-hidden="true" />
                  <span>{CRITERIA_LABELS[key] || key.replace(/-/g, " ")}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="inclusion-criteria-empty">
              Specific inclusion criteria have not yet been recorded in this edition.
            </p>
          )}
        </div>
      </div>

      <div className="inclusion-footer">
        <small>
          <HelpCircle size={14} aria-hidden="true" />
          <span>
            Inclusion is determined strictly by verifiable public record and research criteria, not political or personal affiliation.
          </span>
        </small>
        <Link href="/methodology" className="methodology-link">
          <span>Methodology & Standards</span>
          <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
