"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeMouseHandler,
  useReactFlow,
  ReactFlowProvider,
  Handle,
  Position,
  NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";

import {
  forceSimulation,
  forceManyBody,
  forceLink,
  forceCenter,
  forceCollide,
} from "d3-force";

/* ================= TYPES ================= */

type GraphData = {
  thoughts: { id: number; title: string; description?: string | null }[];
  details: { id: number; text: string; note?: string | null; thought_id: number }[];
  relations: {
    id: number;
    from_detail_id: number;
    to_detail_id: number;
    type_name: string;
  }[];
  relationTypes: { id: number; name: string }[];
};

type KnowledgeNodeData = {
  label: string;
  kind: "Thought" | "Detail";
  color: string;
  size: number;
  info?: string;
};

/* ================= CUSTOM NODE COMPONENT ================= */

/**
 * Ein minimalistischer Punkt-Node im Obsidian-Stil.
 * Der Text erscheint erst beim Heranzoomen oder Hovern.
 */
const KnowledgeNode = ({ data, selected }: NodeProps<KnowledgeNodeData>) => {
  return (
    <div className="relative group flex items-center justify-center">
      {/* Der pulsierende Kern */}
      <div
        className={`rounded-full transition-all duration-500 ease-out ${
          selected ? "ring-4 ring-white shadow-[0_0_20px_rgba(255,255,255,0.5)]" : ""
        }`}
        style={{
          width: data.size,
          height: data.size,
          backgroundColor: data.color,
          boxShadow: `0 0 10px ${data.color}66`,
        }}
      />

      {/* Label - Sichtbar im Fokus oder bei Hover */}
      <div className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 rounded bg-black/80 border border-neutral-700 text-[10px] text-white whitespace-nowrap transition-opacity duration-200 pointer-events-none z-50 
        ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
        {data.label}
      </div>

      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

const nodeTypes = {
  knowledge: KnowledgeNode,
};

/* ================= GRAPH LOGIC & UI ================= */

function VisualGraphInner() {
  const rf = useReactFlow();

  const [raw, setRaw] = useState<GraphData | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Filter-States
  const [hideThoughts, setHideThoughts] = useState(false);

  /* --- DATA LOADING --- */
  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/graph-all");
      const data: GraphData = await res.json();
      setRaw(data);
    } catch (err) {
      console.error("Graph load error:", err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* --- FORCE SIMULATION & GRAPH BUILDING --- */
  const { nodes, edges } = useMemo(() => {
    if (!raw) return { nodes: [], edges: [] };

    const simNodes: any[] = [];
    const simLinks: any[] = [];

    // 1. Gedanken (Zentren)
    if (!hideThoughts) {
      raw.thoughts.forEach((t) => {
        simNodes.push({
          id: `t-${t.id}`,
          data: {
            label: t.title,
            kind: "Thought",
            color: "#60a5fa", // Hellblau
            size: 16,
            info: t.description,
          },
        });
      });
    }

    // 2. Details (Blätter)
    raw.details.forEach((d) => {
      simNodes.push({
        id: `d-${d.id}`,
        data: {
          label: d.text,
          kind: "Detail",
          color: "#a78bfa", // Violett
          size: 10,
          info: d.note,
        },
      });

      // Verbindung zum Ursprungs-Gedanken
      if (!hideThoughts) {
        simLinks.push({ source: `t-${d.thought_id}`, target: `d-${d.id}` });
      }
    });

    // 3. Relationen zwischen Details
    raw.relations.forEach((r) => {
      simLinks.push({
        id: `rel-${r.id}`,
        source: `d-${r.from_detail_id}`,
        target: `d-${r.to_detail_id}`,
        label: r.type_name,
      });
    });

    // D3 Simulation
    const simulation = forceSimulation(simNodes)
      .force("link", forceLink(simLinks).id((d: any) => d.id).distance(100))
      .force("charge", forceManyBody().strength(-250))
      .force("collide", forceCollide().radius(40))
      .force("center", forceCenter(0, 0))
      .stop();

    for (let i = 0; i < 300; ++i) simulation.tick();

    const rfNodes: Node[] = simNodes.map((n) => ({
      id: n.id,
      type: "knowledge",
      position: { x: n.x, y: n.y },
      data: n.data,
    }));

    const rfEdges: Edge[] = simLinks.map((l, i) => ({
      id: l.id || `e-${i}`,
      source: l.source.id || l.source,
      target: l.target.id || l.target,
      style: { stroke: "#333", strokeWidth: 1 },
      animated: false,
    }));

    return { nodes: rfNodes, edges: rfEdges };
  }, [raw, hideThoughts]);

  /* --- INTERACTIVE STYLING --- */
  const highlightIds = useMemo(() => {
    const activeId = selectedNodeId || hoveredNode;
    if (!activeId) return new Set<string>();
    
    const ids = new Set<string>([activeId]);
    edges.forEach(e => {
      if (e.source === activeId) ids.add(e.target);
      if (e.target === activeId) ids.add(e.source);
    });
    return ids;
  }, [selectedNodeId, hoveredNode, edges]);

  const styledNodes = nodes.map(n => ({
    ...n,
    style: {
      opacity: highlightIds.size === 0 || highlightIds.has(n.id) ? 1 : 0.2,
      transition: "opacity 0.3s ease",
    },
  }));

  const styledEdges = edges.map(e => {
    const isActive = (selectedNodeId || hoveredNode) && (e.source === (selectedNodeId || hoveredNode) || e.target === (selectedNodeId || hoveredNode));
    return {
      ...e,
      animated: isActive,
      style: {
        stroke: isActive ? "#60a5fa" : "#222",
        strokeWidth: isActive ? 2 : 1,
        opacity: (selectedNodeId || hoveredNode) ? (isActive ? 1 : 0.1) : 0.4,
      },
    };
  });

  return (
    <div className="flex h-screen w-full bg-[#050505] text-neutral-400 overflow-hidden font-sans">
      {/* SIDEBAR */}
      <aside className="w-72 border-r border-neutral-900 bg-[#0a0a0a] p-6 z-10 flex flex-col gap-6">
        <div>
          <h2 className="text-white font-bold text-lg mb-1 tracking-tight">Atlas View</h2>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Knowledge Graph</p>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-xs cursor-pointer hover:text-white transition-colors">
            <input 
              type="checkbox" 
              className="w-3 h-3 accent-blue-500"
              checked={hideThoughts} 
              onChange={e => setHideThoughts(e.target.checked)} 
            />
            Hauptgedanken ausblenden
          </label>
          <button 
            onClick={loadData}
            className="w-full py-2 bg-neutral-900 border border-neutral-800 rounded text-xs hover:bg-neutral-800 transition-all"
          >
            Refresh Data
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <h3 className="text-[10px] text-neutral-500 uppercase mb-3 font-bold">Details</h3>
          <div className="space-y-1">
            {raw?.details.slice(0, 20).map(d => (
              <div 
                key={d.id} 
                className="text-xs py-1 hover:text-blue-400 cursor-pointer truncate"
                onMouseEnter={() => setHoveredNode(`d-${d.id}`)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                • {d.text}
              </div>
            ))}
          </div>
        </div>

        {selectedNodeId && (
          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg animate-in fade-in zoom-in-95">
            <p className="text-[10px] text-blue-400 font-bold uppercase mb-1">Ausgewählt</p>
            <p className="text-white text-sm font-medium">
              {nodes.find(n => n.id === selectedNodeId)?.data.label}
            </p>
          </div>
        )}
      </aside>

      {/* GRAPH CANVAS */}
      <main className="flex-1 relative">
        <ReactFlow
          nodes={styledNodes}
          edges={styledEdges}
          nodeTypes={nodeTypes}
          onNodeMouseEnter={(_, n) => setHoveredNode(n.id)}
          onNodeMouseLeave={() => setHoveredNode(null)}
          onNodeClick={(_, n) => setSelectedNodeId(n.id)}
          onPaneClick={() => setSelectedNodeId(null)}
          fitView
        >
          <Background color="#111" gap={25} variant={"dots" as any} />
          <Controls className="!bg-neutral-900 !border-neutral-800 !fill-white" />
          <MiniMap 
            style={{ background: "#0a0a0a" }} 
            maskColor="rgba(0,0,0,0.5)"
            nodeColor={n => n.data?.color || "#333"}
          />
        </ReactFlow>
      </main>
    </div>
  );
}

export default function KnowledgeGraph() {
  return (
    <ReactFlowProvider>
      <VisualGraphInner />
    </ReactFlowProvider>
  );
}