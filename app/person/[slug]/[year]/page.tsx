import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { personBySlug } from "@/data/rewind";
import { EventExplorer } from "@/components/rewind/EventExplorer";
export default async function PersonYearPage({params}:{params:Promise<{slug:string,year:string}>}){const {slug,year}=await params;const person=personBySlug(slug);if(!person)notFound();return <div className="page-shell"><header className="page-hero"><Link className="back-link" href={`/person/${slug}`}><ArrowLeft/> {person.name}</Link><span className="eyebrow">YEAR VIEW</span><h1>{year}</h1><p>Every indexed {person.name} record currently attached to this year.</p></header><EventExplorer year={year}/></div>}
