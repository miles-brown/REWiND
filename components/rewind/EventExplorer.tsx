"use client";
import { useState } from "react";
import { Filter, Search, X } from "lucide-react";
import { events } from "@/data/rewind";
import { EventCard } from "./EventCard";

export function EventExplorer({year}:{year?:string}){
  const [query,setQuery]=useState("");const [type,setType]=useState("All");const [status,setStatus]=useState("all");const [sort,setSort]=useState<"asc"|"desc">("asc");
  const types=Array.from(new Set(events.flatMap(e=>e.eventTypes))).sort();
  const result=events.filter(e=>(!year||e.startDate.startsWith(year))&&(status==="all"||e.verificationStatus===status)&&(type==="All"||e.eventTypes.includes(type))&&(e.eventName+e.city+e.country+e.eventTypes.join(" ")).toLowerCase().includes(query.toLowerCase())).sort((a,b)=>sort==="asc"?a.startDate.localeCompare(b.startDate):b.startDate.localeCompare(a.startDate));
  return <div className="event-explorer"><div className="filter-bar"><label className="query-box"><Search/><span className="sr-only">Search events</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search title, place or type"/>{query&&<button onClick={()=>setQuery("")} aria-label="Clear search"><X/></button>}</label><label><Filter/><span className="sr-only">Event type</span><select value={type} onChange={e=>setType(e.target.value)}><option>All</option>{types.map(t=><option key={t}>{t}</option>)}</select></label><label><span className="sr-only">Evidence status</span><select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All evidence</option><option value="verified">Verified</option><option value="provisional">Provisional</option></select></label><label><span className="sr-only">Sort order</span><select value={sort} onChange={e=>setSort(e.target.value as "asc"|"desc")}><option value="asc">Oldest first</option><option value="desc">Newest first</option></select></label></div><div className="result-line"><b>{result.length}</b> matching documented records {year&&<>in <b>{year}</b></>}</div>{result.length?<div className="event-grid">{result.map(e=><EventCard event={e} key={e.id}/>)}</div>:<div className="zero-state"><Search/><h2>No events found</h2><p>Try clearing one or more filters.</p></div>}</div>
}
