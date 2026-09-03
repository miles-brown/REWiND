"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight, CalendarRange, Database, Map, Menu, Search, Shield, Users, X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { CommandPalette } from "./CommandPalette";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  adminOnly?: boolean;
}

const baseNav: NavItem[] = [
  { label: "Explore", href: "/", icon: CalendarRange },
  { label: "Events", href: "/events", icon: Database },
  { label: "People", href: "/people", icon: Users },
  { label: "Compare", href: "/compare", icon: ArrowLeftRight },
  { label: "Places", href: "/places", icon: Map },
  { label: "Sources", href: "/sources", icon: Database },
  { label: "Engine", href: "/admin/evidence", icon: Shield, adminOnly: true },
];

function subscribeAdminSession(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getAdminSessionSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    document.cookie.includes("admin_session") ||
      document.cookie.includes("rewind_admin") ||
      window.localStorage.getItem("rewind_admin") === "true"
  );
}

export function Shell({children}:{children:React.ReactNode}) {
  const pathname = usePathname();
  const [menu,setMenu] = useState(false);
  const [search,setSearch] = useState(false);

  const hasAdminSession = useSyncExternalStore(
    subscribeAdminSession,
    getAdminSessionSnapshot,
    () => false
  );

  const isDev = process.env.NODE_ENV !== "production";
  const isOnAdminRoute = pathname.startsWith("/admin");
  const showAdminNav = isDev || hasAdminSession || isOnAdminRoute;

  const nav = baseNav.filter((item) => !item.adminOnly || showAdminNav);


  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{
      if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k"){
        event.preventDefault();
        setSearch((prev)=>!prev);
      }
      if(event.key==="Escape"){
        setSearch(false);
        setMenu(false);
      }
    };
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[]);

  return <>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <header className="site-header">
      <Link href="/" className="brand" aria-label="REWIND home"><span>R</span><b>REWIND</b><small>EVIDENCE ATLAS</small></Link>
      <nav className="desktop-nav" aria-label="Primary navigation">{nav.map(({label,href,icon:Icon})=><Link key={href} href={href} className={pathname===href?"active":""}><Icon size={15}/>{label}</Link>)}</nav>
      <div className="header-actions"><button className="icon-action search-action" onClick={()=>setSearch(true)} aria-label="Search REWIND"><Search size={17}/><span>Search</span><kbd>⌘ K</kbd></button><button className="icon-action mobile-menu" onClick={()=>setMenu(!menu)} aria-expanded={menu} aria-label="Toggle navigation">{menu?<X/>:<Menu/>}</button></div>
      {menu&&<nav className="mobile-nav" aria-label="Mobile navigation">{nav.map(({label,href,icon:Icon})=><Link key={href} onClick={()=>setMenu(false)} href={href}><Icon size={17}/>{label}</Link>)}</nav>}
    </header>
    <main id="main-content">{children}</main>
    <footer className="site-footer"><Link href="/" className="footer-mark">REWIND</Link><p>A navigable index of documented human history.</p><nav><Link href="/methodology">Methodology</Link><Link href="/sources">Source register</Link><Link href="/events">All events</Link></nav></footer>
    <CommandPalette isOpen={search} onClose={()=>setSearch(false)} />
  </>;
}

