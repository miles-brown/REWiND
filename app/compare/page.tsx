import { ArrowLeftRight } from "lucide-react";
import { TimelineComparison } from "@/components/rewind/TimelineComparison";

export const metadata = {
  title: "Compare Historical Chronologies | REWIND Evidence Atlas",
  description: "Cross-timeline intersection analysis and side-by-side chronological comparisons of historical figures.",
};

export default function ComparePage() {
  return (
    <div className="page-shell compare-page">
      <header className="page-hero">
        <span className="eyebrow">
          <ArrowLeftRight size={14} /> CROSS-TIMELINE INTERSECTION MATRIX
        </span>
        <h1>Compare Chronologies</h1>
        <p>
          Investigate where world leaders, diplomats, and historical figures crossed paths in time and space.
        </p>
      </header>

      <TimelineComparison
        initialPersonA="benjamin-netanyahu"
        initialPersonB="bill-clinton"
      />
    </div>
  );
}
