"use client";
import type { EventRecord } from "@/data/rewind";

function project(lat:number,lon:number){return {x:((lon+180)/360)*100,y:((90-lat)/180)*100};}
export function MapGraphic({events,selected,onSelect}:{events:EventRecord[];selected?:string;onSelect?:(id:string)=>void}){
  const points=events.filter(e=>e.latitude!=null&&e.longitude!=null);
  const coords=points.map(e=>({...project(e.latitude!,e.longitude!),e}));
  const path=coords.map((p,i)=>`${i?"L":"M"}${p.x} ${p.y}`).join(" ");
  return <div className="evidence-map" role="group" aria-label={`Map showing ${points.length} documented event locations`}>
    <div className="map-grid"/><span className="map-label north-america">NORTH<br/>AMERICA</span><span className="map-label europe">EUROPE</span><span className="map-label asia">WEST ASIA</span><span className="map-label atlantic">NORTH ATLANTIC</span>
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path className="travel-path" d={path}/></svg>
    {coords.map(({x,y,e},i)=><button key={e.id} onClick={()=>onSelect?.(e.id)} style={{left:`${x}%`,top:`${y}%`}} className={`map-point ${e.id===selected?"selected":""} ${e.verificationStatus}`} aria-label={`${e.startDate}, ${e.eventName}, ${e.city}`}><i/><span>{e.id===selected?e.city:i%7===0?e.startDate.slice(0,4):""}</span></button>)}
    <div className="map-legend"><span><i className="confirmed-dot"/>Confirmed</span><span><i className="provisional-dot"/>Provisional</span></div>
  </div>
}
