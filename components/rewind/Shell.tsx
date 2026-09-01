"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarRange, Database, Map, Menu, Search, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { events, people, sources } from "@/data/rewind";

const nav = [
  ["Explore","/",CalendarRange], ["Events","/events",Database], ["People","/people",Users], ["Places","/places",Map], ["Sources","/sources",Database]
] as const;

export function Shell({children}:{children:React.ReactNode}) {
  const pathname = usePathname();
  const [menu,setMenu] = useState(false);
  const [search,setSearch] = useState(false);
  const [query,setQuery] = useState("");
  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{
      if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k"){event.preventDefault();setSearch(true)}
      if(event.key==="Escape"){setSearch(false);setMenu(false)}
    };
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[]);
  const results = useMemo(()=>{
    const q=query.trim().toLowerCase(); if(!q) return [];
    return [
      ...events.filter(e=>(e.eventName+" "+e.city+" "+e.eventTypes.join(" ")).toLowerCase().includes(q)).slice(0,6).map(e=>({label:e.eventName,meta:`${e.startDate} · ${e.city}`,href:`/event/${e.slug}`})),
      ...people.filter(p=>p.name.toLowerCase().includes(q)).map(p=>({label:p.name,meta:"Person",href:`/person/${p.slug}`})),
      ...sources.filter(s=>(s.title+" "+s.publisher).toLowerCase().includes(q)).slice(0,4).map(s=>({label:s.title,meta:s.publisher,href:`/source/${s.id}`}))
    ].slice(0,10);
  },[query]);
  return <>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <header className="site-header">
      <Link href="/" className="brand" aria-label="REWIND home"><span>R</span><b>REWIND</b><small>EVIDENCE ATLAS</small></Link>
      <nav className="desktop-nav" aria-label="Primary navigation">{nav.map(([label,href,Icon])=><Link key={href} href={href} className={pathname===href?"active":""}><Icon size={15}/>{label}</Link>)}</nav>
      <div className="header-actions"><button className="icon-action search-action" onClick={()=>setSearch(true)} aria-label="Search REWIND"><Search size={17}/><span>Search</span><kbd>⌘ K</kbd></button><button className="icon-action mobile-menu" onClick={()=>setMenu(!menu)} aria-expanded={menu} aria-label="Toggle navigation">{menu?<X/>:<Menu/>}</button></div>
      {menu&&<nav className="mobile-nav" aria-label="Mobile navigation">{nav.map(([label,href,Icon])=><Link key={href} onClick={()=>setMenu(false)} href={href}><Icon size={17}/>{label}</Link>)}</nav>}
    </header>
    <main id="main-content">{children}</main>
    <footer className="site-footer"><Link href="/" className="footer-mark">REWIND</Link><p>A navigable index of documented human history.</p><nav><Link href="/methodology">Methodology</Link><Link href="/sources">Source register</Link><Link href="/events">All events</Link></nav></footer>
    {search&&<div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search REWIND"><button className="search-backdrop" onClick={()=>setSearch(false)} aria-label="Close search"/><section className="search-panel"><div className="search-input"><Search/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search events, people, places or sources…" aria-label="Search query"/><button onClick={()=>setSearch(false)}><X/></button></div><div className="search-results" aria-live="polite">{query&&!results.length&&<p className="empty-copy">No records match “{query}”.</p>}{results.map((r,i)=><Link key={i} href={r.href} onClick={()=>setSearch(false)}><span>{r.label}</span><small>{r.meta}</small></Link>)}{!query&&<p className="empty-copy">Try “Wye”, “Schneerson”, “United Nations” or a year.</p>}</div></section></div>}
  </>;
}
