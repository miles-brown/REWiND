import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  CircleDashed,
  MapPin,
} from "lucide-react";
import { getPersonTimeline } from "@/lib/rewind";
import { PersonTimeline } from "@/components/rewind/PersonTimeline";
import { PersonCoverageNav } from "@/components/rewind/PersonCoverageNav";

export default async function PersonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const timelineData = await getPersonTimeline(slug);
  if (!timelineData) notFound();

  const { person, events: linked, years } = timelineData;
  const cities = new Set(linked.map((e) => e.city));

  return (
    <div className="page-shell person-page">
      <header className="person-hero">
        <div className="person-monogram large">
          {person.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div className="person-hero-details">
          <span className="eyebrow">DOCUMENTED LIFE</span>
          <h1>{person.name}</h1>
          <p>{person.description}</p>
          <div className="hero-facts">
            <span>
              <CalendarRange size={14} />
              {linked.length} events
            </span>
            <span>
              <MapPin size={14} />
              {cities.size} documented places
            </span>
            <span>
              <CheckCircle2 size={14} />
              {linked.filter((e) => e.verificationStatus === "verified").length} verified
            </span>
            <span>
              <CircleDashed size={14} />
              {linked.filter((e) => e.verificationStatus !== "verified").length} provisional
            </span>
          </div>
        </div>
        <PersonCoverageNav slug={person.slug} records={linked} />
      </header>

      <PersonTimeline person={person} records={linked} />

      <section className="coverage-section compact-coverage">
        <div className="section-heading">
          <div>
            <span className="eyebrow">JUMP TO A YEAR</span>
            <h2>Indexed coverage</h2>
          </div>
          <p>Coverage describes this edition—not every day of a life.</p>
        </div>
        <div className="year-grid">
          {years.map((y) => {
            const n = linked.filter((e) => e.startDate.startsWith(String(y))).length;
            return (
              <Link href={`/person/${slug}/${y}`} key={y}>
                <b>{y}</b>
                <span>
                  {n} event{n === 1 ? "" : "s"}
                </span>
                <i style={{ height: `${Math.min(100, 18 + n * 8)}%` }} />
                <ArrowRight size={14} />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
