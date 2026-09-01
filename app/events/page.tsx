import type { Metadata } from "next";
import { EventExplorer } from "@/components/rewind/EventExplorer";
import { events, verifiedEvents } from "@/data/rewind";
export const metadata:Metadata={title:"Events"};
export default function EventsPage(){return <div className="page-shell"><header className="page-hero"><span className="eyebrow">EVIDENCE REGISTER</span><h1>Documented events</h1><p>Search {events.length} dated records. {verifiedEvents.length} currently meet the verified threshold; the rest remain visibly provisional.</p></header><EventExplorer/></div>}
