"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { 
  ArrowRight, Plus, Link as LinkIcon, Hash, CheckCircle2, 
  MessageSquare, Activity, AlertCircle, TrendingUp, Settings, Edit2
} from "lucide-react";

import AddDetailModal from "../../components/AddDetailModal";
import EditThoughtModal from "../../components/EditThoughtModal";
import EditDetailModal from "../../components/EditDetailModal";

interface Detail {
  id: number;
  thought_id: number;
  text: string;
  note?: string;
  relation_count: number;
}

interface Relation {
  id: number;
  from_detail_id: number;
  to_detail_id: number;
  from_text: string;
  to_text: string;
  type_name: string;
  note?: string;
  confidence?: number;
}

interface RelationType {
  id: number;
  name: string;
}

interface ThoughtData {
  thought: { id: number; title: string; description: string };
  details: Detail[];
}

export default function ThoughtPage() {
  const params = useParams();
  const thoughtId = params.id as string;

  const [data, setData] = useState<ThoughtData | null>(null);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [types, setTypes] = useState<RelationType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditThoughtOpen, setIsEditThoughtOpen] = useState(false);
  const [editingDetail, setEditingDetail] = useState<Detail | null>(null);

  // Form State für Relationen
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [type, setType] = useState("");
  const [note, setNote] = useState("");
  const [conf, setConf] = useState("");

  const loadAll = useCallback(async () => {
    try {
      setIsLoading(true);
      const [r1, r2, r3] = await Promise.all([
        fetch(`/api/thoughts/${thoughtId}`),
        fetch(`/api/thoughts/${thoughtId}/relations`),
        fetch(`/api/relation-types`)
      ]);
      if (!r1.ok || !r2.ok || !r3.ok) throw new Error();
      setData(await r1.json());
      setRelations(await r2.json());
      setTypes(await r3.json());
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  }, [thoughtId]);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function createRelation() {
    if (!from || !to || !type) return;
    await fetch("/api/relations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from_detail_id: Number(from),
        to_detail_id: Number(to),
        relation_type_id: Number(type),
        note: note || null,
        confidence: conf ? parseFloat(conf.replace(',', '.')) : null,
      }),
    });
    setNote(""); setConf(""); loadAll();
  }

  const selectStyle = "w-full p-3 bg-neutral-900 border border-white/10 rounded-xl text-sm text-white outline-none";
  const optionStyle = "bg-neutral-900 text-white py-2";

  if (isLoading || !data) return <div className="p-20 text-center animate-pulse text-neutral-500">Wissensgraph wird geladen...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      
      {/* HEADER mit Edit-Button */}
      <header className="bg-gradient-to-r from-neutral-900 to-transparent p-8 rounded-3xl border border-white/5 relative group">
        <button 
          onClick={() => setIsEditThoughtOpen(true)}
          className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-neutral-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
        >
          <Settings size={20} />
        </button>
        <div className="flex items-center gap-3 mb-4 text-blue-400">
          <Hash size={16} />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Node ID: {data.thought.id}</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white">{data.thought.title}</h1>
        <p className="text-neutral-400 mt-4 text-lg font-light leading-relaxed max-w-3xl">{data.thought.description}</p>
      </header>

      {/* KOMPONENTEN mit Edit-Buttons */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><CheckCircle2 className="text-emerald-500" size={20} /> Komponenten</h2>
          <button onClick={() => setIsDetailModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 font-bold active:scale-95 transition-all">
            <Plus size={16} /> hinzufügen
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {data.details.map((d) => (
            <div key={d.id} className="group bg-white/[0.02] p-6 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all relative">
              <button onClick={() => setEditingDetail(d)} className="absolute top-4 right-4 p-2 text-neutral-600 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-all">
                <Edit2 size={14} />
              </button>
              <div className="flex justify-between items-start mb-3">
                <span className="text-[9px] font-mono text-neutral-600">#{d.id}</span>
                <div className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[10px] font-bold"><LinkIcon size={10} className="inline mr-1"/>{d.relation_count}</div>
              </div>
              <p className="text-neutral-100 font-medium leading-snug">{d.text}</p>
              {d.note && <div className="mt-3 text-xs text-neutral-500 italic flex gap-2"><MessageSquare size={14}/>{d.note}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* BEZIEHUNGEN (dein ursprünglicher Code) */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><TrendingUp className="text-blue-500" size={20} /> Beziehungs-Logik</h2>
        <div className="bg-neutral-900 border border-white/10 p-6 rounded-3xl shadow-2xl">
          <div className="grid gap-4 lg:grid-cols-5 items-end">
            <div className="space-y-2 lg:col-span-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase ml-1">Ursprung</label>
              <select className={selectStyle} value={from} onChange={e => setFrom(e.target.value)}>
                <option value="">Quelle wählen</option>
                {data.details.map(d => <option key={d.id} value={d.id} className={optionStyle}>{d.text}</option>)}
              </select>
            </div>
            <div className="space-y-2 lg:col-span-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase ml-1">Relationstyp</label>
              <select className={selectStyle} value={type} onChange={e => setType(e.target.value)}>
                <option value="">Typ wählen</option>
                {types.map(t => <option key={t.id} value={t.id} className={optionStyle}>{t.name}</option>)}
              </select>
            </div>
            <div className="space-y-2 lg:col-span-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase ml-1">Ziel</label>
              <select className={selectStyle} value={to} onChange={e => setTo(e.target.value)}>
                <option value="">Ziel wählen</option>
                {data.details.map(d => <option key={d.id} value={d.id} className={optionStyle}>{d.text}</option>)}
              </select>
            </div>
            <div className="space-y-2 lg:col-span-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase ml-1">Confidence</label>
              <input className={selectStyle} placeholder="0.85" value={conf} onChange={e => setConf(e.target.value)} />
            </div>
            <button onClick={createRelation} className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl p-3 font-bold transition-all shadow-lg active:scale-95">Anlegen</button>
          </div>
          <div className="mt-4"><input className={selectStyle} placeholder="Notiz..." value={note} onChange={e => setNote(e.target.value)} /></div>
        </div>

        <div className="grid gap-3">
          {relations.map(r => (
            <div key={r.id} className="bg-white/[0.01] border border-white/5 p-5 rounded-2xl flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1"><div className="text-[10px] text-neutral-600 font-bold uppercase">Von</div><div className="text-sm text-neutral-300">{r.from_text}</div></div>
              <div className="flex flex-col items-center min-w-[160px] py-2 bg-blue-500/5 rounded-xl border border-blue-500/10">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{r.type_name}</span>
                <ArrowRight size={14} className="text-blue-500/50" />
              </div>
              <div className="flex-1 md:text-right"><div className="text-[10px] text-neutral-600 font-bold uppercase">Zu</div><div className="text-sm text-neutral-300">{r.to_text}</div></div>
            </div>
          ))}
        </div>
      </section>

      {/* MODALS INTEGRATION */}
      {isDetailModalOpen && (
        <AddDetailModal thoughtId={thoughtId} onClose={() => setIsDetailModalOpen(false)} onSuccess={() => { setIsDetailModalOpen(false); loadAll(); }} />
      )}
      {isEditThoughtOpen && (
        <EditThoughtModal thought={data.thought} onClose={() => setIsEditThoughtOpen(false)} onSuccess={() => { setIsEditThoughtOpen(false); loadAll(); }} />
      )}
      {editingDetail && (
        <EditDetailModal detail={editingDetail} onClose={() => setEditingDetail(null)} onSuccess={() => { setEditingDetail(null); loadAll(); }} />
      )}
    </div>
  );
}