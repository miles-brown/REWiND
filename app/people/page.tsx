import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, UserRound } from "lucide-react";
import { events, people } from "@/data/rewind";
export const metadata:Metadata={title:"People"};
export default function PeoplePage(){return <div className="page-shell"><header className="page-hero"><span className="eyebrow">PEOPLE</span><h1>Lives in the record</h1><p>People are connected through dated evidence, not static biographical prose.</p></header><div className="people-grid">{people.map(p=>{const count=events.filter(e=>e.participants.some(x=>x.personId===p.id)).length;return <Link href={`/person/${p.slug}`} key={p.id}><span className="person-monogram">{p.name.split(" ").map(n=>n[0]).slice(0,2).join("")}</span><div><small>{p.birth.slice(0,4)}—{p.death?.slice(0,4)||"present"}</small><h2>{p.name}</h2><p>{p.description}</p><b><UserRound/> {count} linked events</b></div><ArrowRight/></Link>})}</div></div>}
