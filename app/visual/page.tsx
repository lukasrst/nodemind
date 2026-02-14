"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useReactFlow,
  ReactFlowProvider,
  Handle,
  Position,
  NodeProps,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { Search, Info, RefreshCw, ChevronRight, Hash, Eye, EyeOff } from "lucide-react";

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

const KnowledgeNode = ({ data, selected }: NodeProps<KnowledgeNodeData>) => {
  const isThought = data.kind === "Thought";
  return (
    <div className="relative group flex items-center justify-center">
      <div
        className={`rounded-full transition-all duration-500 ease-out border-2 ${
          selected 
            ? "ring-4 ring-white/30 border-white scale-110 shadow-[0_0_25px_rgba(255,255,255,0.4)]" 
            : "border-transparent"
        }`}
        style={{
          width: data.size,
          height: data.size,
          backgroundColor: data.color,
          boxShadow: `0 0 15px ${data.color}44`,
        }}
      />

      <div className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1.5 rounded-lg bg-neutral-900/95 border border-neutral-700 text-white whitespace-nowrap transition-all duration-200 pointer-events-none z-50 shadow-2xl
        ${selected ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0"}`}>
        <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full`} style={{backgroundColor: data.color}}></span>
            <span className={`${isThought ? "font-bold text-[11px] uppercase tracking-tight" : "text-[10px]"}`}>
                {data.label}
            </span>
        </div>
      </div>

      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

const nodeTypes = { knowledge: KnowledgeNode };

/* ================= GRAPH LOGIC & UI ================= */

function VisualGraphInner() {
  const rf = useReactFlow();
  const [raw, setRaw] = useState<GraphData | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [hideThoughts, setHideThoughts] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/graph-all");
      const data: GraphData = await res.json();
      setRaw(data);
    } catch (err) {
      console.error("Graph load error:", err);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const { nodes, edges } = useMemo(() => {
    if (!raw) return { nodes: [], edges: [] };
    const simNodes: any[] = [];
    const simLinks: any[] = [];

    if (!hideThoughts) {
      raw.thoughts.forEach((t) => {
        simNodes.push({
          id: `t-${t.id}`,
          data: { label: t.title, kind: "Thought", color: "#3b82f6", size: 24, info: t.description }
        });
      });
    }

    raw.details.forEach((d) => {
      simNodes.push({
        id: `d-${d.id}`,
        data: { label: d.text, kind: "Detail", color: "#a78bfa", size: 12, info: d.note }
      });
      if (!hideThoughts) {
        simLinks.push({ source: `t-${d.thought_id}`, target: `d-${d.id}`, type: "parent" });
      }
    });

    raw.relations.forEach((r) => {
      simLinks.push({
        id: `rel-${r.id}`,
        source: `d-${r.from_detail_id}`,
        target: `d-${r.to_detail_id}`,
        label: r.type_name,
        type: "relation"
      });
    });

    const simulation = forceSimulation(simNodes)
      .force("link", forceLink(simLinks).id((d: any) => d.id).distance(l => l.type === "parent" ? 70 : 130))
      .force("charge", forceManyBody().strength(-350))
      .force("collide", forceCollide().radius(50))
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
      label: l.type === "relation" ? l.label : "",
      // Die weißen Kästchen wurden hier entfernt durch einfache Text-Stylings ohne Hintergrund
      labelStyle: { fill: "#888", fontSize: 9, fontWeight: 500, pointerEvents: 'none' },
      labelBgStyle: { fill: 'none' }, 
      markerEnd: l.type === "relation" ? { type: MarkerType.ArrowClosed, color: "#444", width: 15, height: 15 } : undefined,
      style: { 
        stroke: l.type === "parent" ? "#222" : "#333", 
        strokeWidth: l.type === "parent" ? 1 : 1.2,
        strokeDasharray: l.type === "parent" ? "5 5" : "0",
      },
    }));

    return { nodes: rfNodes, edges: rfEdges };
  }, [raw, hideThoughts]);

  const focusNode = (id: string) => {
    const node = nodes.find(n => n.id === id);
    if (node) {
        setSelectedNodeId(id);
        rf.setCenter(node.position.x, node.position.y, { zoom: 1.4, duration: 800 });
    }
  };

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

  const filteredData = useMemo(() => {
    if (!raw) return [];
    return raw.thoughts.map(t => ({
        ...t,
        details: raw.details.filter(d => d.thought_id === t.id && d.text.toLowerCase().includes(searchTerm.toLowerCase()))
    })).filter(t => t.details.length > 0 || t.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [raw, searchTerm]);

  return (
    <div className="flex h-full w-full bg-[#050505] text-neutral-300 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-80 border-r border-neutral-900 bg-[#0a0a0a] z-10 flex flex-col shadow-2xl shrink-0">
        <div className="p-6 border-b border-neutral-900">
          <div className="flex items-center justify-between mb-5">
            <div>
                <h2 className="text-white font-bold text-lg tracking-tight">Atlas View</h2>
                <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-widest mt-0.5">Knowledge Graph</p>
            </div>
            <button onClick={loadData} className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-500 hover:text-white">
                <RefreshCw size={16} />
            </button>
          </div>

          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" size={14} />
            <input 
                type="text" 
                placeholder="Suchen..." 
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button 
            onClick={() => setHideThoughts(!hideThoughts)}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg border text-[11px] font-medium transition-all ${
                hideThoughts 
                ? "bg-blue-600/10 border-blue-500/50 text-blue-400" 
                : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
            }`}
          >
            {hideThoughts ? <EyeOff size={14} /> : <Eye size={14} />}
            Hauptgedanken {hideThoughts ? "ausgeblendet" : "einblenden"}
          </button>
        </div>

        {/* Gruppierte Liste für mehr Ordnung */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {filteredData.map(thought => (
            <div key={thought.id} className="space-y-2">
                <div 
                    onClick={() => focusNode(`t-${thought.id}`)}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-600 hover:text-blue-400 cursor-pointer transition-colors px-2"
                >
                    <Hash size={10} /> {thought.title}
                </div>
                <div className="space-y-1">
                    {thought.details.map(d => (
                        <div 
                            key={d.id} 
                            onClick={() => focusNode(`d-${d.id}`)}
                            onMouseEnter={() => setHoveredNode(`d-${d.id}`)}
                            onMouseLeave={() => setHoveredNode(null)}
                            className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                                selectedNodeId === `d-${d.id}` 
                                ? "bg-blue-600/20 text-white" 
                                : "hover:bg-neutral-900 text-neutral-400 hover:text-neutral-200"
                            }`}
                        >
                            <span className="text-[11px] truncate">{d.text}</span>
                            <ChevronRight size={12} className={`opacity-0 group-hover:opacity-100 ${selectedNodeId === `d-${d.id}` ? "opacity-100" : ""}`} />
                        </div>
                    ))}
                </div>
            </div>
          ))}
        </div>

        {selectedNodeId && (
          <div className="p-4 m-4 bg-neutral-900 border border-neutral-800 rounded-xl animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start gap-3">
                <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                    <p className="text-[10px] text-neutral-500 font-bold uppercase mb-1">Details</p>
                    <p className="text-white text-xs font-medium leading-relaxed break-words">
                        {nodes.find(n => n.id === selectedNodeId)?.data.label}
                    </p>
                    {nodes.find(n => n.id === selectedNodeId)?.data.info && (
                        <p className="text-[10px] text-neutral-500 mt-2 pt-2 border-t border-neutral-800 italic">
                            {nodes.find(n => n.id === selectedNodeId)?.data.info}
                        </p>
                    )}
                </div>
            </div>
          </div>
        )}
      </aside>

      {/* GRAPH CANVAS */}
      <main className="flex-1 relative">
        <ReactFlow
          nodes={nodes.map(n => ({...n, style: { opacity: highlightIds.size === 0 || highlightIds.has(n.id) ? 1 : 0.1, transition: 'opacity 0.3s' }}))}
          edges={edges.map(e => ({...e, style: { ...e.style, opacity: selectedNodeId || hoveredNode ? (highlightIds.has(e.source) && highlightIds.has(e.target) ? 1 : 0.05) : 0.4 }}))}
          nodeTypes={nodeTypes}
          onNodeMouseEnter={(_, n) => setHoveredNode(n.id)}
          onNodeMouseLeave={() => setHoveredNode(null)}
          onNodeClick={(_, n) => setSelectedNodeId(n.id)}
          onPaneClick={() => setSelectedNodeId(null)}
          fitView
        >
          <Background color="#111" gap={35} variant={"dots" as any} />
          <Controls className="!bg-neutral-900 !border-neutral-800 !fill-white" />
          <MiniMap 
            style={{ background: "#0a0a0a", border: '1px solid #222', borderRadius: '8px' }} 
            maskColor="rgba(0,0,0,0.6)"
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