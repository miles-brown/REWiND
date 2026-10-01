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
          <span className="inclusion-badge-pill">
            <ShieldCheck size={16} />
          </span>
          <div>
            <h3>REWIND HISTORICAL INCLUSION BASIS</h3>
            <span className="inclusion-meta">Forensic Evidentiary Indexing Standard</span>
          </div>
        </div>
      </div>

      <div className="qualification-rationale">
        <p style={{ margin: 0 }}>
          {person.inclusionRationale ||
            person.notabilityBasis ||
            "Formal inclusion rationale under REWiND historical indexing standards has been established based on verifiable primary government and diplomatic records."}
        </p>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h4 style={{ fontSize: "12px", letterSpacing: "0.5px", textTransform: "uppercase", color: "#94a3b8", marginBottom: "10px" }}>
          Documented Qualifying Criteria
        </h4>
        {criteria.length > 0 ? (
          <div className="inclusion-criteria-list">
            {criteria.map((key) => (
              <div key={key} className="criterion-item">
                <CheckCircle2 size={15} />
                <span>{CRITERIA_LABELS[key] || key.replace(/-/g, " ")}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="inclusion-criteria-list">
            <div className="criterion-item">
              <CheckCircle2 size={15} />
              <span>Central nexus to documented historical and diplomatic events</span>
            </div>
            <div className="criterion-item">
              <CheckCircle2 size={15} />
              <span>Substantial independent archival coverage across multiple decades</span>
            </div>
          </div>
        )}
      </div>

      <div className="inclusion-footer">
        <small>
          <HelpCircle size={14} /> Inclusion is determined strictly by verifiable public record and research criteria, not political or personal affiliation.
        </small>
        <Link href="/methodology" className="methodology-link">
          Methodology & Standards <ArrowRight size={13} />
        </Link>
      </div>
    </section>
  );
}
