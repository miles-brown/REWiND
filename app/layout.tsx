import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/rewind/Shell";
export const metadata: Metadata = { title: { default:"REWIND — Evidence Atlas", template:"%s · REWIND" }, description: "Explore documented lives through synchronized timelines, maps and primary evidence." };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body><Shell>{children}</Shell></body></html>; }
