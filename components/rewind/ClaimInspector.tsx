import {
  CheckCircle2,
  AlertTriangle,
  FileText,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  XCircle,
  Eye,
  Scale,
} from "lucide-react";
import type { ClaimRecord, ClaimStatus } from "@/lib/rewind";

function getStatusBadgeClass(status: ClaimStatus): string {
  switch (status) {
    case "ESTABLISHED":
      return "status-established";
    case "STRONGLY SUPPORTED":
      return "status-strongly-supported";
    case "SUPPORTED":
      return "status-supported";
    case "PROVISIONAL":
      return "status-provisional";
    case "DISPUTED":
      return "status-disputed";
    case "CONTRADICTED":
    case "DEMONSTRABLY FALSE":
      return "status-contradicted";
    default:
      return "status-unverified";
  }
}

export function ClaimInspector({
  claims = [],
  title = "Factual Claims & Evidential Decomposition",
}: {
  claims?: ClaimRecord[];
  title?: string;
}) {
  if (!claims || claims.length === 0) {
    return (
      <section className="claims-panel empty-claims">
        <div className="section-header">
          <span className="eyebrow">
            <Scale size={14} /> FORENSIC EVIDENTIARY AUDIT
          </span>
          <h3>{title}</h3>
        </div>
        <p className="empty-copy">
          No discrete factual claims have been decomposed for this record yet. Claims will appear as primary archival transcripts and video frames are indexed.
        </p>
      </section>
    );
  }

  return (
    <section className="claims-panel" aria-label="Evidential Claim Decomposition">
      <div className="section-header">
        <span className="eyebrow">
          <Scale size={14} /> FORENSIC EVIDENTIARY DECOMPOSITION
        </span>
        <h3>{title} ({claims.length})</h3>
        <p>
          Every event in REWiND is evaluated as a set of discrete, individually supportable claims with distinct evidentiary strength and epistemic classifications.
        </p>
      </div>

      <div className="claims-list">
        {claims.map((claim, idx) => (
          <article key={claim.id || idx} className="claim-card">
            <div className="claim-card-header">
              <div className="claim-badges">
                <span className={`claim-status-pill ${getStatusBadgeClass(claim.claimStatus)}`}>
                  {claim.claimStatus === "ESTABLISHED" ? (
                    <CheckCircle2 size={13} />
                  ) : claim.claimStatus === "DISPUTED" || claim.claimStatus === "CONTRADICTED" ? (
                    <AlertTriangle size={13} />
                  ) : (
                    <HelpCircle size={13} />
                  )}
                  {claim.claimStatus}
                </span>

                <span className="epistemic-class-pill">
                  <FileText size={12} /> {claim.epistemicClass}
                </span>

                {claim.isAttributedOnly && (
                  <span className="attributed-pill">Attributed Assertion Only</span>
                )}
              </div>

              {claim.legalStatus && (
                <span className="legal-status-tag">Status: {claim.legalStatus}</span>
              )}
            </div>

            <h4 className="claim-statement">{claim.statement}</h4>

            {claim.supportingExcerpt && (
              <blockquote className="claim-excerpt">
                “{claim.supportingExcerpt}”
              </blockquote>
            )}

            {/* Evidential Attachments */}
            {claim.evidence && claim.evidence.length > 0 && (
              <div className="claim-evidence-section">
                <small className="evidence-header-label">DOCUMENTED EVIDENCE ({claim.evidence.length})</small>
                <div className="evidence-items">
                  {claim.evidence.map((ev) => (
                    <div
                      key={ev.id}
                      className={`evidence-item ${ev.contradictsClaim ? "contradictory" : "supporting"}`}
                    >
                      <div className="evidence-item-header">
                        <span className="evidence-form">
                          <Eye size={12} /> {ev.evidenceForm} ({ev.directness})
                        </span>
                        {ev.contradictsClaim ? (
                          <span className="contradiction-badge">
                            <XCircle size={12} /> Contradicts Claim
                          </span>
                        ) : (
                          <span className="strength-badge">
                            <ShieldCheck size={12} /> {ev.evidenceStrength}
                          </span>
                        )}
                      </div>

                      {ev.supportingExcerpt && (
                        <p className="evidence-text">“{ev.supportingExcerpt}”</p>
                      )}

                      <div className="evidence-source-meta">
                        {ev.citationLocator && (
                          <span className="locator">Locator: {ev.citationLocator}</span>
                        )}
                        {ev.sourceTitle && (
                          <span className="source-title">
                            Source: {ev.sourcePublisher ? `${ev.sourcePublisher} — ` : ""}
                            <i>{ev.sourceTitle}</i>
                          </span>
                        )}
                        {ev.sourceUrl && (
                          <a href={ev.sourceUrl} target="_blank" rel="noreferrer" aria-label="Open source">
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
