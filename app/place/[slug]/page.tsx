import { notFound } from "next/navigation";
import { events } from "@/data/rewind";
import { EventCard } from "@/components/rewind/EventCard";
import { MapGraphic } from "@/components/rewind/MapGraphic";
export default async function PlacePage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const linked=events.filter(e=>e.city.toLowerCase().replace(/[^a-z0-9]+/g,"-")===slug);if(!linked.length)notFound();return <div className="page-shell"><header className="page-hero"><span className="eyebrow">PLACE CHRONOLOGY</span><h1>{linked[0].city}</h1><p>{linked.length} indexed records in {linked[0].country}.</p></header><MapGraphic events={linked} selected={linked[0].id}/><section className="content-section"><div className="event-grid">{linked.map(e=><EventCard event={e} key={e.id}/>)}</div></section></div>}
