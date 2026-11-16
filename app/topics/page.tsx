import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Calendar, Layers, Newspaper } from "lucide-react";
import { getTopics } from "@/lib/rewind/topics";

export const metadata: Metadata = {
  title: "Continuous News & Historical Topics — REWIND Evidence Atlas",
  description: "Non-person timelines for continuous news subjects, global conflicts, diplomatic peace processes, and historical investigations.",
};

export default async function TopicsPage() {
  const topics = await getTopics();

  return (
    <div className="page-shell">
      <header className="page-hero">
        <span className="eyebrow flex items-center gap-1.5 text-sky-400">
          <Layers size={14} aria-hidden="true" />
          <span>NON-PERSON TIMELINES</span>
        </span>
        <h1>Continuous News & Historical Topics</h1>
        <p>
          Thread events together across multiple figures, venues, and nations for continuous historical subjects,
          diplomatic treaties, regional conflicts, and investigative chronicles.
        </p>
      </header>

      {topics.length === 0 ? (
        <div
          className="zero-state my-8 mx-auto max-w-xl rounded-xl border border-dashed border-white/10 bg-slate-900/40 p-12 text-center"
          role="status"
        >
          <Newspaper size={36} className="mx-auto mb-4 text-slate-500" aria-hidden="true" />
          <h2 className="text-lg font-bold text-slate-200">No topic subjects registered</h2>
          <p className="mt-2 text-sm text-slate-400">
            Historical topic timelines are currently being synthesized from the archival ingestion stream.
          </p>
        </div>
      ) : (
        <div className="my-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((t) => (
            <Link
              key={t.id}
              href={`/topic/${t.slug}`}
              className="group flex flex-col justify-between rounded-xl border border-white/10 bg-slate-900/60 p-6 text-inherit no-underline transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400/40 hover:bg-slate-900/80 hover:shadow-lg hover:shadow-sky-950/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <div>
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-sky-400 mb-2">
                  {t.category}
                </span>
                <h2 className="text-lg font-bold text-slate-100 group-hover:text-sky-300 transition-colors line-clamp-2">
                  {t.name}
                </h2>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {t.summary}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px]">
                  <Calendar size={13} className="text-slate-500" aria-hidden="true" />
                  <span>
                    {t.startedDate ? t.startedDate.slice(0, 4) : "—"} — {t.endedDate ? t.endedDate.slice(0, 4) : "Present"}
                  </span>
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-sky-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Explore</span>
                  <ArrowRight size={13} aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
