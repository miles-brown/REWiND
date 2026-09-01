"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, CirclePause, CirclePlay, ExternalLink, Filter, Gauge, MapPin, RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { events, sourceById } from "@/data/rewind";
import { MapGraphic } from "./MapGraphic";

export function RewindExplorer(){
  const [type,setType]=useState("All"); const [status,setStatus]=useState("all");
  const filtered=useMemo(()=>events.filter(e=>(type==="All"||e.eventTypes.includes(type))&&(status==="all"||e.verificationStatus===status)).sort((a,b)=>a.startDate.localeCompare(b.startDate)),[type,status]);
  const [index,setIndex]=useState(Math.min(18,filtered.length-1)); const [playing,setPlaying]=useState(false); const [speed,setSpeed]=useState(1400);
  useEffect(()=>{if(!playing||filtered.length<2)return;const timer=setInterval(()=>setIndex(i=>i>=filtered.length-1?0:i+1),speed);return()=>clearInterval(timer)},[playing,speed,filtered.length]);
  const safeIndex=Math.min(index,Math.max(0,filtered.length-1));
  const event=filtered[safeIndex]||events[0]; const source=sourceById(event.sourceIds[0]);
  const types=Array.from(new Set(events.flatMap(e=>e.eventTypes))).sort();
  const date=new Date(event.startDate+"T12:00:00");
  const choose=(id:string)=>{const i=filtered.findIndex(e=>e.id===id);if(i>=0)setIndex(i)};
  return <section className="rewind-workspace" aria-label="Interactive Rewind explorer">
    <div className="workspace-toolbar"><div className="person-lockup"><span className="person-dot"/><div><small>EXPLORING</small><b>Benjamin Netanyahu</b></div></div><div className="workspace-filters"><label><Filter size={14}/><span className="sr-only">Event type</span><select value={type} onChange={e=>{setType(e.target.value);setIndex(0)}}><option>All</option>{types.map(t=><option key={t}>{t}</option>)}</select></label><label><span className="sr-only">Verification status</span><select value={status} onChange={e=>{setStatus(e.target.value);setIndex(0)}}><option value="all">All evidence</option><option value="verified">Verified only</option><option value="provisional">Provisional</option></select></label><button onClick={()=>{setType("All");setStatus("all");setIndex(0)}} aria-label="Clear filters"><RotateCcw size={15}/></button></div><div className="record-count"><b>{filtered.length}</b><span>records in view</span></div></div>
    <div className="workspace-main">
      <MapGraphic events={filtered} selected={event.id} onSelect={choose}/>
      <article className="selected-event" aria-live="polite"><div className="record-label"><span>{event.id.replace("evt-", "EVENT ")}</span><span className={`status ${event.verificationStatus}`}>{event.verificationStatus}</span></div><time>{date.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</time><h1>{event.eventName}</h1><p className="event-place"><MapPin/>{event.venueName||event.city}<small>{event.city}, {event.country} · {event.locationPrecision} precision</small></p><div className="detail-tags">{event.eventTypes.map(t=><span key={t}>{t}</span>)}</div><div className="evidence-summary"><div><small>PRIMARY EVIDENCE</small><b>{source?.title}</b><span>{source?.publisher}</span></div><a href={source?.url} target="_blank" rel="noreferrer" aria-label="Open primary source"><ExternalLink/></a></div><dl className="event-facts"><div><dt>Date</dt><dd>{event.datePrecision}</dd></div><div><dt>Time</dt><dd>{event.localStartTime||"Not established"}</dd></div><div><dt>Confidence</dt><dd>{event.confidence}</dd></div><div><dt>Medium</dt><dd>{event.medium.join(", ")}</dd></div></dl><Link className="primary-link" href={`/event/${event.slug}`}>Open event and evidence <ArrowRight/></Link></article>
    </div>
    <div className="rewind-console"><div className="console-date"><small>REWIND TO</small><b>{date.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}).toUpperCase()}</b></div><div className="play-controls"><button onClick={()=>setIndex(i=>Math.max(0,i-1))} aria-label="Previous event"><ChevronLeft/></button><button className="main-play" onClick={()=>setPlaying(!playing)} aria-label={playing?"Pause timeline":"Play timeline"}>{playing?<CirclePause/>:<CirclePlay/>}</button><button onClick={()=>setIndex(i=>Math.min(filtered.length-1,i+1))} aria-label="Next event"><ChevronRight/></button></div><div className="slider-wrap"><Slider aria-label="Timeline event position" min={0} max={Math.max(0,filtered.length-1)} step={1} value={[safeIndex]} onValueChange={v=>setIndex(v[0])}/><div><span>{filtered[0]?.startDate.slice(0,4)}</span><b>{event.startDate.slice(0,4)}</b><span>{filtered.at(-1)?.startDate.slice(0,4)}</span></div></div><label className="speed"><Gauge/><span className="sr-only">Playback speed</span><select value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value="2200">0.5×</option><option value="1400">1×</option><option value="750">2×</option></select></label><Link href={`/person/benjamin-netanyahu/${event.startDate.slice(0,4)}`} className="calendar-jump" aria-label={`Open ${event.startDate.slice(0,4)} year view`}><CalendarDays/></Link></div>
  </section>
}
