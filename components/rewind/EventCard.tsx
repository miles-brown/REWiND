import Link from "next/link";
import { ArrowUpRight, CheckCircle2, CircleDashed, MapPin } from "lucide-react";
import type { EventRecord } from "@/data/rewind";

export function EventCard({event,compact=false}:{event:EventRecord;compact?:boolean}) {
  const verified=event.verificationStatus==="verified";
  return <Link className={`event-card ${compact?"compact":""}`} href={`/event/${event.slug}`}>
    <div className="event-card-top"><time>{new Date(event.startDate+"T12:00:00").toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</time><span className={verified?"status verified":"status provisional"}>{verified?<CheckCircle2/>:<CircleDashed/>}{verified?"Verified":"Provisional"}</span></div>
    <h3>{event.eventName}</h3>
    <p><MapPin size={13}/>{event.venueName||event.city}, {event.country}</p>
    <div className="card-tags">{event.eventTypes.slice(0,3).map(t=><span key={t}>{t}</span>)}</div>
    <ArrowUpRight className="card-arrow" size={17}/>
  </Link>;
}
