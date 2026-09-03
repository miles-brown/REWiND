"use client";

import { useMemo } from "react";
import type { EventRecord } from "@/data/rewind";

function project(lat: number, lon: number) {
  return {
    x: ((lon + 180) / 360) * 100,
    y: ((90 - lat) / 180) * 100,
  };
}

export function MapGraphic({
  events,
  selected,
  onSelect,
}: {
  events: EventRecord[];
  selected?: string;
  onSelect?: (id: string) => void;
}) {
  const points = useMemo(
    () => events.filter((e) => e.latitude != null && e.longitude != null),
    [events]
  );

  const coords = useMemo(
    () => points.map((e) => ({ ...project(e.latitude!, e.longitude!), e })),
    [points]
  );

  // Group overlapping points by proximity
  const clusters = useMemo(() => {
    const map = new Map<string, typeof coords>();
    coords.forEach((pt) => {
      const key = `${pt.x.toFixed(1)}_${pt.y.toFixed(1)}`;
      const existing = map.get(key) || [];
      existing.push(pt);
      map.set(key, existing);
    });
    return Array.from(map.values()).map((group) => {
      const topPt = group.find((p) => p.e.id === selected) || group[group.length - 1];
      return {
        x: topPt.x,
        y: topPt.y,
        event: topPt.e,
        count: group.length,
        hasSelected: group.some((p) => p.e.id === selected),
        allVerified: group.every((p) => p.e.verificationStatus === "verified"),
      };
    });
  }, [coords, selected]);

  // Construct curved trajectory arcs between consecutive chronological locations
  const arcs = useMemo(() => {
    if (coords.length < 2) return "";
    let d = "";
    for (let i = 0; i < coords.length - 1; i++) {
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 0.5) continue; // Same city

      // Compute arc midpoint offset for curvature
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2 - Math.min(12, dist * 0.25);

      d += `${d ? " " : ""}M${p1.x.toFixed(2)},${p1.y.toFixed(2)} Q${midX.toFixed(2)},${midY.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
    }
    return d;
  }, [coords]);

  return (
    <div
      className="evidence-map"
      role="group"
      aria-label={`Geospatial map showing ${points.length} documented event locations`}
    >
      <div className="map-grid" />

      {/* Vector Basemap Outlines */}
      <svg className="basemap-vectors" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {/* Simplified World Coastlines */}
        {/* North America */}
        <path
          className="coastline"
          d="M 15 22 Q 18 18 24 16 Q 30 20 28 32 Q 25 38 22 45 Q 26 48 24 55 Q 20 52 18 42 Z"
        />
        {/* South America */}
        <path
          className="coastline"
          d="M 28 55 Q 35 58 34 70 Q 30 82 28 90 Q 25 80 26 62 Z"
        />
        {/* Western & Central Europe */}
        <path
          className="coastline"
          d="M 48 24 Q 54 22 56 30 Q 52 38 46 36 Q 44 28 48 24 Z"
        />
        {/* Mediterranean Basin & Levant */}
        <path
          className="coastline focal"
          d="M 46 36 Q 58 35 62 38 Q 60 44 55 42 Q 48 42 46 36 Z"
        />
        {/* Africa */}
        <path
          className="coastline"
          d="M 46 42 Q 60 42 58 60 Q 55 78 50 82 Q 42 65 44 48 Z"
        />
        {/* Middle East & Asia */}
        <path
          className="coastline focal"
          d="M 58 32 Q 70 28 85 30 Q 82 45 74 52 Q 64 48 58 40 Z"
        />

        {/* Dynamic Flight Arcs */}
        {arcs && <path className="travel-path animated-arc" d={arcs} />}
      </svg>

      <span className="map-label north-america">NORTH<br />AMERICA</span>
      <span className="map-label europe">EUROPE</span>
      <span className="map-label asia">WEST ASIA / LEVANT</span>
      <span className="map-label atlantic">NORTH ATLANTIC</span>

      {/* Interactive Map Nodes & Clusters */}
      {clusters.map((cluster) => {
        const isSelected = cluster.hasSelected;
        return (
          <button
            key={cluster.event.id}
            onClick={() => onSelect?.(cluster.event.id)}
            style={{ left: `${cluster.x}%`, top: `${cluster.y}%` }}
            className={`map-point ${isSelected ? "selected" : ""} ${
              cluster.allVerified ? "verified" : "provisional"
            }`}
            aria-label={`${cluster.event.startDate}, ${cluster.event.eventName}, ${cluster.event.city}`}
          >
            <i />
            {cluster.count > 1 && <b className="cluster-badge">{cluster.count}</b>}
            <span>
              {isSelected
                ? `${cluster.event.city} (${cluster.count})`
                : cluster.count > 3
                ? cluster.event.city
                : ""}
            </span>
          </button>
        );
      })}

      <div className="map-legend">
        <span><i className="confirmed-dot" /> Verified Record</span>
        <span><i className="provisional-dot" /> Provisional</span>
        <span><i className="arc-indicator" /> Trajectory Arc</span>
      </div>
    </div>
  );
}
