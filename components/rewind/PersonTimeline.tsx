"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, CirclePause, CirclePlay, ExternalLink, Gauge, MapPin, SkipBack, SkipForward } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import type { EventRecord, Person } from "@/data/rewind";
import { people, sourceById } from "@/data/rewind";
import { MapGraphic } from "./MapGraphic";

export function PersonTimeline({person,records}:{person:Person;records:EventRecord[]}){
  const ordered=useMemo(()=>[...records].sort((a,b)=>a.startDate.localeCompare(b.startDate)),[records]);
  const [index,setIndex]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [speed,setSpeed]=useState(1600);
  useEffect(()=>{if(!playing||ordered.length<2)return;const timer=setInterval(()=>setIndex(i=>{if(i+1>=ordered.length-1){setPlaying(false);return ordered.length-1}return i+1}),speed);return()=>clearInterval(timer)},[playing,speed,ordered.length]);
  if(!ordered.length)return <div className="zero-state"><h2>No timeline records yet</h2><p>This edition does not yet contain a dated event for {person.name}.</p></div>;
  const safeIndex=Math.min(index,ordered.length-1);
  const event=ordered[safeIndex];
  const source=sourceById(event.sourceIds[0]);
  const date=new Date(event.startDate+"T12:00:00");
  const moveTo=(next:number)=>{setPlaying(false);setIndex(Math.min(Math.max(next,0),ordered.length-1))};
  const choose=(id:string)=>{const next=ordered.findIndex(record=>record.id===id);if(next>=0)moveTo(next)};
  const progress=Math.round(((safeIndex+1)/ordered.length)*100);
  return <section className="person-time-machine" aria-label={`${person.name} chronological timeline`}>
    <div className="person-time-status"><div><span className="live-pulse"/><small>REWINDING</small><b>{person.name}</b></div><p><strong>{safeIndex+1}</strong> of {ordered.length} documented events</p></div>
    <div className="person-time-main">
      <article className="person-event-stage" key={event.id} aria-live="polite">
        <div className="person-event-kicker"><span>{event.startDate.slice(0,4)}</span><span className={`status ${event.verificationStatus}`}>{event.verificationStatus}</span></div>
        <time>{date.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}{event.localStartTime?` · ${event.localStartTime}`:""}</time>
        <h2>{event.eventName}</h2>
        <p className="event-place"><MapPin/>{event.venueName||event.city}<small>{event.city}, {event.country} · {event.locationPrecision} precision</small></p>
        <div className="detail-tags">{event.eventTypes.map(type=><span key={type}>{type}</span>)}</div>
        <div className="person-event-participants"><small>DOCUMENTED WITH</small><div>{event.participants.map(participant=><Link key={participant.personId} href={`/person/${people.find(item=>item.id===participant.personId)?.slug||person.slug}`}>{participant.name}<span>{participant.role}</span></Link>)}</div></div>
        <div className="evidence-summary"><div><small>EVIDENCE</small><b>{source?.title}</b><span>{source?.publisher} · {event.medium.join(", ")}</span></div>{source&&<a href={source.url} target="_blank" rel="noreferrer" aria-label={`Open source from ${source.publisher}`}><ExternalLink/></a>}</div>
        <Link className="primary-link" href={`/event/${event.slug}`}>Open complete event record <ArrowRight/></Link>
      </article>
      <div className="person-map-stage"><div className="map-stage-label"><span>DOCUMENTED POSITION</span><b>{event.city}</b><small>{progress}% through indexed chronology</small></div><MapGraphic events={ordered.slice(0,safeIndex+1)} selected={event.id} onSelect={choose}/></div>
    </div>
    <div className="person-time-console">
      <div className="console-date"><small>CURRENT EVENT</small><b>{date.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}).toUpperCase()}</b></div>
      <div className="play-controls" aria-label="Timeline playback controls"><button onClick={()=>moveTo(0)} disabled={safeIndex===0} aria-label="First event"><SkipBack/></button><button onClick={()=>moveTo(safeIndex-1)} disabled={safeIndex===0} aria-label="Previous event"><ChevronLeft/></button><button className="main-play" onClick={()=>setPlaying(value=>!value)} disabled={safeIndex===ordered.length-1} aria-label={playing?"Pause timeline":"Play timeline"}>{playing?<CirclePause/>:<CirclePlay/>}</button><button onClick={()=>moveTo(safeIndex+1)} disabled={safeIndex===ordered.length-1} aria-label="Next event"><ChevronRight/></button><button onClick={()=>moveTo(ordered.length-1)} disabled={safeIndex===ordered.length-1} aria-label="Last event"><SkipForward/></button></div>
      <div className="slider-wrap"><div className="slider-heading"><span>FIRST EVENT</span><b>DRAG TO REWIND</b><span>LAST EVENT</span></div><Slider aria-label={`${person.name} timeline position`} aria-valuetext={`${safeIndex+1} of ${ordered.length}: ${event.startDate}, ${event.eventName}`} min={0} max={Math.max(0,ordered.length-1)} step={1} value={[safeIndex]} onValueChange={value=>moveTo(value[0])}/><div className="slider-dates"><span>{ordered[0].startDate}</span><b>{event.startDate}</b><span>{ordered.at(-1)?.startDate}</span></div></div>
      <label className="speed"><Gauge/><span className="sr-only">Playback speed</span><select value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value="2600">0.5×</option><option value="1600">1×</option><option value="850">2×</option></select></label>
    </div>
  </section>
}
