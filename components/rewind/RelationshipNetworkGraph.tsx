"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Network, Table } from "lucide-react";
import { getMonogram } from "@/lib/rewind/utils";
import type { RelationshipItem } from "@/lib/rewind/types";

interface NetworkNode {
  id: string;
  name: string;
  count: number;
  x: number;
  y: number;
}

interface NetworkLink {
  source: string;
  target: string;
  sourceName: string;
  targetName: string;
  sharedEventsCount: number;
}

export function RelationshipNetworkGraph({
  relationships,
}: {
  relationships: RelationshipItem[];
}) {
  const [viewMode, setViewMode] = useState<"graph" | "table">("graph");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [minIntersections, setMinIntersections] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filtered relationship links
  const filteredLinks = useMemo(() => {
    return relationships.filter((rel) => {
      if (rel.sharedEventsCount < minIntersections) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesSource = rel.sourceName.toLowerCase().includes(q);
        const matchesTarget = rel.targetName.toLowerCase().includes(q);
        if (!matchesSource && !matchesTarget) return false;
      }
      return true;
    });
  }, [relationships, minIntersections, searchQuery]);

  // Compute node topology positions
  const { nodes, links, nodeMap } = useMemo(() => {
    const countsMap = new Map<string, { id: string; name: string; count: number }>();

    filteredLinks.forEach((rel) => {
      const srcNode = countsMap.get(rel.source) || { id: rel.source, name: rel.sourceName, count: 0 };
      srcNode.count += rel.sharedEventsCount;
      countsMap.set(rel.source, srcNode);

      const tgtNode = countsMap.get(rel.target) || { id: rel.target, name: rel.targetName, count: 0 };
      tgtNode.count += rel.sharedEventsCount;
      countsMap.set(rel.target, tgtNode);
    });

    const nodeArray = Array.from(countsMap.values());
    const totalNodes = nodeArray.length;
    const centerX = 400;
    const centerY = 300;
    const radius = Math.min(240, Math.max(120, totalNodes * 20));

    const positionedNodes: NetworkNode[] = nodeArray.map((node, idx) => {
      const angle = (idx / (totalNodes || 1)) * 2 * Math.PI - Math.PI / 2;
      return {
        ...node,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    const positionedNodeMap = new Map<string, NetworkNode>();
    positionedNodes.forEach((n) => positionedNodeMap.set(n.id, n));

    const networkLinks: NetworkLink[] = filteredLinks.map((rel) => ({
      source: rel.source,
      target: rel.target,
      sourceName: rel.sourceName,
      targetName: rel.targetName,
      sharedEventsCount: rel.sharedEventsCount,
    }));

    return { nodes: positionedNodes, links: networkLinks, nodeMap: positionedNodeMap };
  }, [filteredLinks]);

  const selectedNode = selectedNodeId ? nodeMap.get(selectedNodeId) : undefined;
  const selectedNodeLinks = selectedNodeId
    ? links.filter((l) => l.source === selectedNodeId || l.target === selectedNodeId)
    : [];

  return (
    <div className="network-topology-container" aria-label="Diplomatic Relationship Topology Network">
      {/* Controls Header */}
      <div
        className="network-controls-bar"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          padding: "16px 20px",
          background: "rgba(9, 19, 26, 0.75)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ display: "inline-flex", borderRadius: "6px", background: "rgba(0, 0, 0, 0.4)", padding: "2px" }} role="group" aria-label="View Mode">
            <button
              type="button"
              onClick={() => setViewMode("graph")}
              className={`view-toggle-btn ${viewMode === "graph" ? "active" : ""}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: 700,
                borderRadius: "5px",
                border: "none",
                background: viewMode === "graph" ? "rgba(56, 189, 248, 0.2)" : "transparent",
                color: viewMode === "graph" ? "#38bdf8" : "#94a3b8",
                cursor: "pointer",
              }}
              aria-pressed={viewMode === "graph"}
            >
              <Network size={14} /> Graph
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`view-toggle-btn ${viewMode === "table" ? "active" : ""}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: 700,
                borderRadius: "5px",
                border: "none",
                background: viewMode === "table" ? "rgba(56, 189, 248, 0.2)" : "transparent",
                color: viewMode === "table" ? "#38bdf8" : "#94a3b8",
                cursor: "pointer",
              }}
              aria-pressed={viewMode === "table"}
            >
              <Table size={14} /> Table
            </button>
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter figure..."
            aria-label="Filter figure by name"
            style={{
              background: "rgba(0, 0, 0, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "6px",
              padding: "6px 12px",
              color: "#f8fafc",
              fontSize: "max(16px, 12px)",
              width: "160px",
            }}
          />

          <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "max(16px, 12px)", color: "#cbd5e1" }}>
            <span>Min Intersections:</span>
            <select
              value={minIntersections}
              onChange={(e) => setMinIntersections(Number(e.target.value))}
              aria-label="Minimum intersection threshold"
              style={{
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "6px",
                padding: "4px 8px",
                color: "#f8fafc",
                fontSize: "max(16px, 12px)",
              }}
            >
              <option value={1}>1+ Meetings</option>
              <option value={2}>2+ Meetings</option>
              <option value={3}>3+ Meetings</option>
              <option value={5}>5+ Meetings</option>
            </select>
          </label>
        </div>

        <div style={{ fontSize: "12px", color: "#94a3b8" }}>
          <b>{nodes.length}</b> Figures · <b>{links.length}</b> Bilateral Ties
        </div>
      </div>

      {viewMode === "graph" ? (
        <div
          className="graph-canvas-wrap"
          style={{
            position: "relative",
            background: "radial-gradient(ellipse at center, rgba(14, 165, 233, 0.05) 0%, #030712 100%)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "12px",
            padding: "20px",
            overflow: "hidden",
            minHeight: "620px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg viewBox="0 0 800 600" width="100%" height="100%" style={{ maxHeight: "600px" }} role="img" aria-label="Interactive Diplomatic Relationship Topology Graph">
            {/* Draw Links */}
            <g className="graph-links" stroke="rgba(56, 189, 248, 0.25)" role="group" aria-label="Bilateral connection lines">
              {links.map((link) => {
                const srcNode = nodeMap.get(link.source);
                const tgtNode = nodeMap.get(link.target);
                if (!srcNode || !tgtNode) return null;

                const isHighlighted =
                  selectedNodeId &&
                  (link.source === selectedNodeId || link.target === selectedNodeId);

                return (
                  <line
                    key={`${link.source}-${link.target}`}
                    x1={srcNode.x}
                    y1={srcNode.y}
                    x2={tgtNode.x}
                    y2={tgtNode.y}
                    stroke={isHighlighted ? "#38bdf8" : "rgba(56, 189, 248, 0.25)"}
                    strokeWidth={Math.min(6, Math.max(1.5, link.sharedEventsCount * 0.8))}
                    strokeOpacity={isHighlighted ? 0.9 : selectedNodeId ? 0.1 : 0.4}
                    aria-label={`Connection: ${link.sourceName} and ${link.targetName} (${link.sharedEventsCount} shared events)`}
                  />
                );
              })}
            </g>

            {/* Draw Nodes */}
            <g className="graph-nodes" role="group" aria-label="Diplomatic Figure Nodes">
              {nodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const nodeRadius = Math.min(26, Math.max(14, 12 + node.count * 1.2));
                const nodeConnections = links
                  .filter((l) => l.source === node.id || l.target === node.id)
                  .map((l) => (l.source === node.id ? `${l.targetName} (${l.sharedEventsCount} events)` : `${l.sourceName} (${l.sharedEventsCount} events)`))
                  .join(", ");

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                    style={{ cursor: "pointer" }}
                    tabIndex={0}
                    role="button"
                    aria-pressed={isSelected}
                    aria-label={`Figure ${node.name}, ${node.count} total documented intersections`}
                    aria-describedby={`node-desc-${node.id}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedNodeId(isSelected ? null : node.id);
                      }
                    }}
                  >
                    <title>{node.name}</title>
                    <desc id={`node-desc-${node.id}`}>
                      {nodeConnections
                        ? `Connected figures: ${nodeConnections}`
                        : "No bilateral connections matching current filters."}
                    </desc>
                    <circle
                      r={nodeRadius}
                      fill={isSelected ? "#0284c7" : "#09131a"}
                      stroke={isSelected ? "#38bdf8" : "rgba(56, 189, 248, 0.6)"}
                      strokeWidth={isSelected ? 3 : 1.5}
                    />
                    <text
                      textAnchor="middle"
                      dy="4"
                      fontSize="10"
                      fontWeight="bold"
                      fill="#f8fafc"
                      pointerEvents="none"
                    >
                      {getMonogram(node.name)}
                    </text>
                    <text
                      textAnchor="middle"
                      dy={nodeRadius + 14}
                      fontSize="11"
                      fill={isSelected ? "#38bdf8" : "#cbd5e1"}
                      fontWeight={isSelected ? "bold" : "normal"}
                      pointerEvents="none"
                    >
                      {node.name.length > 18 ? `${node.name.slice(0, 16)}…` : node.name}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Screen Reader Live Region for Selection */}
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {selectedNode
              ? `Selected ${selectedNode.name}. ${selectedNodeLinks.length} connections: ${selectedNodeLinks
                  .map((l) => (l.source === selectedNode.id ? `${l.targetName} (${l.sharedEventsCount} events)` : `${l.sourceName} (${l.sharedEventsCount} events)`))
                  .join(", ")}`
              : "No figure selected."}
          </div>

          {/* Selected Node Sidebar Card */}
          {selectedNode && (
            <div
              className="selected-node-panel"
              role="region"
              aria-label="Selected figure details"
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                width: "280px",
                background: "rgba(9, 19, 26, 0.95)",
                border: "1px solid rgba(56, 189, 248, 0.4)",
                borderRadius: "10px",
                padding: "16px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div className="sr-only" role="status" aria-live="polite">
                Selected figure {selectedNode.name}, {selectedNodeLinks.length} direct bilateral ties.
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div>
                  <span className="eyebrow" style={{ fontSize: "10px", color: "#38bdf8", fontWeight: 800 }}>
                    SELECTED FIGURE
                  </span>
                  <h3 style={{ margin: "2px 0 0", fontSize: "15px", color: "#f8fafc" }}>{selectedNode.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedNodeId(null)}
                  style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "14px" }}
                  aria-label="Close selection panel"
                >
                  ✕
                </button>
              </div>

              <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 12px" }}>
                <b>{selectedNodeLinks.length}</b> direct bilateral ties documented.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "180px", overflowY: "auto", marginBottom: "12px" }}>
                {selectedNodeLinks.map((link) => {
                  const otherSlug = link.source === selectedNode.id ? link.target : link.source;
                  const otherName = link.source === selectedNode.id ? link.targetName : link.sourceName;

                  return (
                    <Link
                      key={`${link.source}-${link.target}`}
                      href={`/relationship/${selectedNode.id}/${otherSlug}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 8px",
                        background: "rgba(255, 255, 255, 0.04)",
                        borderRadius: "6px",
                        color: "#f1f5f9",
                        textDecoration: "none",
                        fontSize: "12px",
                      }}
                    >
                      <span>{otherName}</span>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#38bdf8" }}>
                        {link.sharedEventsCount} evt
                      </span>
                    </Link>
                  );
                })}
              </div>

              <Link
                href={`/person/${selectedNode.id}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  width: "100%",
                  padding: "8px",
                  background: "rgba(56, 189, 248, 0.15)",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  borderRadius: "6px",
                  color: "#38bdf8",
                  textDecoration: "none",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                <span>View Full Person Profile</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>
      ) : (
        /* Accessible Table View */
        <div
          className="network-table-wrap"
          role="region"
          aria-label="Relationship Network Table"
          style={{
            background: "rgba(9, 19, 26, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <caption className="sr-only">Bilateral diplomatic relationships and documented co-appearances</caption>
            <thead>
              <tr style={{ background: "rgba(0, 0, 0, 0.4)", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#94a3b8" }}>
                <th style={{ padding: "12px 16px" }}>Figure A</th>
                <th style={{ padding: "12px 16px" }}>Figure B</th>
                <th style={{ padding: "12px 16px" }}>Shared Events</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr
                  key={`${link.source}-${link.target}`}
                  style={{
                    borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                    color: "#f8fafc",
                  }}
                >
                  <td style={{ padding: "12px 16px", fontWeight: 600 }}>{link.sourceName}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600 }}>{link.targetName}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: "4px", background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", fontWeight: 800, fontSize: "11px" }}>
                      {link.sharedEventsCount} meeting{link.sharedEventsCount === 1 ? "" : "s"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <Link
                      href={`/relationship/${link.source}/${link.target}`}
                      style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#38bdf8", textDecoration: "none", fontSize: "12px", fontWeight: 600 }}
                    >
                      Compare <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
