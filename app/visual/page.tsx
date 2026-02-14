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
import { 
  Search, Info, RefreshCw, ChevronRight, Hash, 
  Eye, EyeOff, LayoutGrid, Activity, Target 
} from "lucide-react";

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
  isActive: boolean;
};

/* ================= CUSTOM NODE COMPONENT ================= */

const KnowledgeNode = ({ data, selected }: NodeProps<KnowledgeNodeData>) => {
  const isThought = data.kind === "Thought";
  
  return (
    <div className="relative flex items-center justify-center">
      {/* Glow Effect Layer */}
      <div 
        className={`absolute inset-0 rounded-full blur-md transition-opacity duration-500 ${
          selected || data.isActive ? "opacity-60" : "opacity-0"
        }`}
        style={{ backgroundColor: data.color }}
      />
      
      {/* Main Node Body */}
      <div
        className={`relative rounded-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border-2 ${
          selected 
            ? "border-white scale-125 z-50 shadow-2xl" 
            : "border-white/10 scale-100"
        }`}
        style={{
          width: data.size,
          height: data.size,
          backgroundColor: data.color,
          boxShadow: selected ? `0 0 30px ${data.color}` : `0 0 10px ${data.color}22`,
        }}
      />

      {/* Label Tooltip */}
      <div className={`absolute left-1/2 -translate-x-1/2 top-full mt-3 px-3 py-2 rounded-xl bg-black/90 backdrop-blur-md border border-white/10 text-white whitespace-nowrap transition-all duration-300 pointer-events-none z-[100] shadow-[0_10px_30px_rgba(0,0,0,0.5)]
        ${selected ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
        <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-black">
                {data.kind}
            </span>
            <span className={`text-xs ${isThought ? "font-bold" : "font-medium"}`}>
                {data.label}
            </span>
        </div>
      </div>

      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
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
  const [isSimulating, setIsSimulating] = useState(false);

  const loadData = useCallback(async () => {
    setIsSimulating(true);
    try {
      const res = await fetch("/api/graph-all");
      const data: GraphData = await res.json();
      setRaw(data);
      setTimeout(() => rf.fitView({ duration: 1000, padding: 0.2 }), 100);
    } catch (err) {
      console.error("Graph load error:", err);
    } finally {
      setIsSimulating(false);
    }
  }, [rf]);

  useEffect(() => { loadData(); }, [loadData]);

  // Highlight Logic
  const activeIds = useMemo(() => {
    const activeId = selectedNodeId || hoveredNode;
    if (!activeId) return new Set<string>();
    
    const ids = new Set<string>([activeId]);
    if (!raw) return ids;

    // Finde verbundene IDs basierend auf Relations und Hierarchie
    raw.details.forEach(d => {
        const dId = `d-${d.id}`;
        const tId = `t-${d.thought_id}`;
        if (activeId === dId) ids.add(tId);
        if (activeId === tId) ids.add(dId);
    });

    raw.relations.forEach(r => {
        const from = `d-${r.from_detail_id}`;
        const to = `d-${r.to_detail_id}`;
        if (activeId === from) ids.add(to);
        if (activeId === to) ids.add(from);
    });

    return ids;
  }, [selectedNodeId, hoveredNode, raw]);

  const { nodes, edges } = useMemo(() => {
    if (!raw) return { nodes: [], edges: [] };
    const simNodes: any[] = [];
    const simLinks: any[] = [];

    if (!hideThoughts) {
      raw.thoughts.forEach((t) => {
        simNodes.push({
          id: `t-${t.id}`,
          data: { label: t.title, kind: "Thought", color: "#3b82f6", size: 32, info: t.description }
        });
      });
    }

    raw.details.forEach((d) => {
      simNodes.push({
        id: `d-${d.id}`,
        data: { label: d.text, kind: "Detail", color: "#a78bfa", size: 14, info: d.note }
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

    // D3 Simulation
    const simulation = forceSimulation(simNodes)
      .force("link", forceLink(simLinks).id((d: any) => d.id).distance(l => l.type === "parent" ? 80 : 160))
      .force("charge", forceManyBody().strength(-500))
      .force("collide", forceCollide().radius(60))
      .force("center", forceCenter(0, 0))
      .stop();

    for (let i = 0; i < 300; ++i) simulation.tick();

    const rfNodes: Node[] = simNodes.map((n) => ({
      id: n.id,
      type: "knowledge",
      position: { x: n.x, y: n.y },
      data: { ...n.data, isActive: activeIds.has(n.id) },
    }));

    const rfEdges: Edge[] = simLinks.map((l, i) => {
      const isConnectedToActive = (selectedNodeId || hoveredNode) && 
        (l.source.id === (selectedNodeId || hoveredNode) || l.target.id === (selectedNodeId || hoveredNode));

      return {
        id: l.id || `e-${i}`,
        source: l.source.id || l.source,
        target: l.target.id || l.target,
        label: l.type === "relation" ? l.label : "",
        animated: !!isConnectedToActive, // ANIMATION BEI AUSWAHL
        labelStyle: { fill: "#555", fontSize: 10, fontWeight: 600, pointerEvents: 'none' },
        labelBgStyle: { fill: 'transparent' }, 
        markerEnd: l.type === "relation" ? { 
            type: MarkerType.ArrowClosed, 
            color: isConnectedToActive ? "#3b82f6" : "#333", 
            width: 20, height: 20 
        } : undefined,
        style: { 
          stroke: isConnectedToActive ? "#3b82f6" : (l.type === "parent" ? "#1a1a1a" : "#262626"), 
          strokeWidth: isConnectedToActive ? 2 : 1,
          strokeDasharray: l.type === "parent" ? "4 4" : "0",
          transition: 'stroke 0.3s, stroke-width 0.3s'
        },
      };
    });

    return { nodes: rfNodes, edges: rfEdges };
  }, [raw, hideThoughts, activeIds, selectedNodeId, hoveredNode]);

  const focusNode = (id: string) => {
    const node = nodes.find(n => n.id === id);
    if (node) {
        setSelectedNodeId(id);
        rf.setCenter(node.position.x, node.position.y, { zoom: 1.2, duration: 1000 });
    }
  };

  const filteredData = useMemo(() => {
    if (!raw) return [];
    return raw.thoughts.map(t => ({
        ...t,
        details: raw.details.filter(d => d.thought_id === t.id && d.text.toLowerCase().includes(searchTerm.toLowerCase()))
    })).filter(t => t.details.length > 0 || t.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [raw, searchTerm]);

  return (
    <div className="flex h-screen w-full bg-black text-neutral-300 overflow-hidden font-sans">
      {/* SIDEBAR */}
      <aside className="w-80 border-r border-white/5 bg-[#050505] z-20 flex flex-col shadow-[20px_0_50px_rgba(0,0,0,0.8)]">
        <div className="p-8 border-b border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <div>
                <h2 className="text-white font-black text-xl tracking-tighter italic">ATLAS.OS</h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-[0.3em]">Knowledge System v2</p>
                </div>
            </div>
            <button 
                onClick={loadData} 
                className={`p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all ${isSimulating ? "animate-spin" : ""}`}
            >
                <RefreshCw size={16} className="text-white" />
            </button>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-blue-500 transition-colors" size={14} />
            <input 
                type="text" 
                placeholder="Deep Search..." 
                className="w-full bg-neutral-900/50 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all placeholder:text-neutral-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button 
            onClick={() => setHideThoughts(!hideThoughts)}
            className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl border text-[11px] font-bold tracking-tight transition-all ${
                hideThoughts 
                ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]" 
                : "bg-neutral-900 border-white/5 text-neutral-400 hover:border-white/20"
            }`}
          >
            <div className="flex items-center gap-2">
                {hideThoughts ? <EyeOff size={14} /> : <Eye size={14} />}
                Gedanken-Ebene
            </div>
            <span className="opacity-50">{hideThoughts ? "OFF" : "ON"}</span>
          </button>
        </div>

        {/* LIST SECTION */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          <div className="flex items-center gap-2 px-2 text-neutral-600">
            <LayoutGrid size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">Index</span>
          </div>
          
          {filteredData.map(thought => (
            <div key={thought.id} className="space-y-3">
                <div 
                    onClick={() => focusNode(`t-${thought.id}`)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-blue-500/80 hover:text-blue-400 cursor-pointer transition-colors px-2 group"
                >
                    <Target size={12} className="group-hover:scale-125 transition-transform" /> {thought.title}
                </div>
                <div className="space-y-1.5">
                    {thought.details.map(d => (
                        <div 
                            key={d.id} 
                            onClick={() => focusNode(`d-${d.id}`)}
                            onMouseEnter={() => setHoveredNode(`d-${d.id}`)}
                            onMouseLeave={() => setHoveredNode(null)}
                            className={`group flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-all border ${
                                selectedNodeId === `d-${d.id}` 
                                ? "bg-white text-black border-white" 
                                : "hover:bg-white/5 text-neutral-400 border-transparent hover:border-white/5"
                            }`}
                        >
                            <span className="text-[11px] font-medium truncate">{d.text}</span>
                            <ChevronRight size={14} className={`transition-transform duration-300 ${selectedNodeId === `d-${d.id}` ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"}`} />
                        </div>
                    ))}
                </div>
            </div>
          ))}
        </div>

        {/* INFO PANEL */}
        {selectedNodeId && (
          <div className="p-6 m-4 bg-gradient-to-br from-neutral-900 to-black border border-white/10 rounded-[2rem] animate-in fade-in slide-in-from-bottom-4 shadow-2xl">
            <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Info size={16} className="text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                    <h4 className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-2">Node Insight</h4>
                    <p className="text-white text-xs font-bold leading-relaxed mb-3">
                        {nodes.find(n => n.id === selectedNodeId)?.data.label}
                    </p>
                    {nodes.find(n => n.id === selectedNodeId)?.data.info && (
                        <p className="text-[11px] text-neutral-400 leading-relaxed bg-white/5 p-3 rounded-xl italic">
                            {nodes.find(n => n.id === selectedNodeId)?.data.info}
                        </p>
                    )}
                </div>
            </div>
          </div>
        )}
      </aside>

      {/* GRAPH CANVAS */}
      <main className="flex-1 relative bg-[#020202]">
        <div className="absolute top-8 left-8 z-10 flex items-center gap-4 pointer-events-none">
            <div className="px-4 py-2 bg-black/50 backdrop-blur-md border border-white/5 rounded-full flex items-center gap-3">
                <Activity size={14} className="text-green-500" />
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    {nodes.length} Nodes & {edges.length} Connections Active
                </span>
            </div>
        </div>

        <ReactFlow
          nodes={nodes.map(n => ({
            ...n, 
            style: { 
                opacity: activeIds.size === 0 || activeIds.has(n.id) ? 1 : 0.08, 
                transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)' 
            }
          }))}
          edges={edges.map(e => ({
            ...e, 
            style: { 
                ...e.style, 
                opacity: (selectedNodeId || hoveredNode) 
                    ? (activeIds.has(e.source) && activeIds.has(e.target) ? 1 : 0.02) 
                    : 0.15 
            }
          }))}
          nodeTypes={nodeTypes}
          onNodeMouseEnter={(_, n) => setHoveredNode(n.id)}
          onNodeMouseLeave={() => setHoveredNode(null)}
          onNodeClick={(_, n) => setSelectedNodeId(n.id)}
          onPaneClick={() => setSelectedNodeId(null)}
          fitView
          minZoom={0.1}
          maxZoom={2}
        >
          <Background color="#111" gap={40} variant={"dots" as any} size={1} />
          <Controls className="!bg-neutral-900 !border-white/10 !fill-white !rounded-xl !overflow-hidden !shadow-2xl" />
          <MiniMap 
            style={{ 
                background: "#050505", 
                border: '1px solid rgba(255,255,255,0.05)', 
                borderRadius: '20px',
                overflow: 'hidden'
            }} 
            maskColor="rgba(0,0,0,0.8)"
            nodeColor={n => n.data?.color || "#333"}
          />
        </ReactFlow>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #333; }
        .react-flow__edge-path { transition: stroke-dashoffset 0.5s ease; }
      `}</style>
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