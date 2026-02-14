"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lightbulb, ArrowRight, Sparkles, Plus, X } from "lucide-react";
import AddThoughtModal from "./components/AddThoughtModal";

interface Thought {
  id: string | number;
  title: string;
  description: string;
  createdAt?: string;
}

export default function Home() {
  const [rows, setRows] = useState<Thought[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function load() {
    try {
      setIsLoading(true);
      const r = await fetch("/api/thoughts");
      if (!r.ok) throw new Error();
      const data = await r.json();
      setRows(data);
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="w-full min-h-full bg-transparent">
      
      {/* Header Bereich */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-500">
              Main Feed
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
            Your Thoughts
          </h1>
          <p className="text-neutral-400 font-light">
            Hier sind alle deine festgehaltenen Ideen und Notizen.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex-shrink-0"
        >
          <Plus size={20} />
          <span>Hinzufügen</span>
        </button>
      </header>

      {/* Grid Content & Loading/Error States (unverändert) */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 rounded-2xl bg-white/[0.03] animate-pulse border border-white/[0.05]" />
          ))}
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rows.map((t) => (
            <Link
              key={t.id}
              href={`/thought/${t.id}`}
              className="group relative bg-white/[0.03] border border-white/5 p-7 rounded-2xl transition-all duration-300 hover:bg-white/[0.06] hover:border-white/10 hover:-translate-y-1"
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                  <div className="px-2 py-1 bg-white/5 rounded text-[10px] font-mono text-neutral-500 border border-white/5">#{t.id}</div>
                  <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>
                <h2 className="text-lg font-semibold text-white mb-3 leading-snug group-hover:text-blue-400 transition-colors">{t.title}</h2>
                <p className="text-neutral-400 leading-relaxed line-clamp-3 text-sm font-light">{t.description}</p>
                <div className="mt-6 pt-6 border-t border-white/[0.05] flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                   <span className="text-[10px] text-neutral-600 uppercase tracking-widest font-bold">Concept</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal Komponente */}
      {isModalOpen && (
        <AddThoughtModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            load(); // Liste aktualisieren
          }} 
        />
      )}
    </div>
  );
}